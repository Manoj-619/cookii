# 🌿 Cookii Cloud Infrastructure & AWS Setup Guide

Production-ready AWS infrastructure specification and deployment guide for the **Cookii** home cook booking platform.

---

## 🏛️ High-Level Cloud Architecture

```text
                               +-----------------------------+
                               |     Clients & Applications  |
                               | (Mobile Apps & Web Admin)   |
                               +--------------+--------------+
                                              |
                                              | HTTPS (443) / WSS
                                              v
                               +-----------------------------+
                               |     Route 53 DNS            |
                               | api.cookii.in | admin.cookii.in
                               +--------------+--------------+
                                              |
                                              v
                              +-------------------------------+
                              |  AWS Application Load Balancer|
                              |  (ALB - TLS Termination)      |
                              +---------------+---------------+
                                     |                 |
                   Host: api.cookii.in                 Host: admin.cookii.in
                   Path: /api/*, /socket.io/*          Path: /*
                                     |                 |
                                     v                 v
                 +-----------------------+     +-----------------------+
                 |  Target Group: Backend|     |  Target Group: Admin  |
                 |  Port 4000 (HTTP)     |     |  Port 3000 (HTTP)     |
                 +-----------+-----------+     +-----------+-----------+
                             |                             |
                             +--------------+--------------+
                                            |
                                            v
     +=============================================================================+
     |                       AWS ECS Fargate Cluster: cookii-prod                  |
     |                                                                             |
     |   +------------------------------------+   +----------------------------+   |
     |   | Task: cookii-backend               |   | Task: cookii-admin         |   |
     |   | - NestJS Monolith                  |   | - Next.js Operations Portal|   |
     |   | - 0.5 vCPU / 1024 MB RAM           |   | - 0.5 vCPU / 1024 MB RAM   |   |
     |   | - Port 4000                        |   | - Port 3000                |   |
     |   +-----------------+------------------+   +----------------------------+   |
     +=====================|=======================================================+
                           |
       +-------------------+-------------------+-------------------+
       |                   |                   |                   |
       v                   v                   v                   v
+--------------+    +--------------+    +--------------+    +--------------+
| MongoDB Atlas|    | AWS Elasti-  |    | Amazon S3    |    | Amazon SES   |
| (M10 Cluster)|    | Cache Redis  |    | Bucket:      |    | Transactional|
| Data, KYC,   |    | Realtime,    |    | cookii-media |    | Emails &     |
| Bookings     |    | BullMQ jobs  |    | -uploads     |    | Notifications|
+--------------+    +--------------+    +--------------+    +--------------+
       ^                   ^
       |                   |
+------+-------------------+-------------------+
|      AWS Systems Manager (SSM)               |
|      Parameter Store / SecureString Secrets  |
+----------------------------------------------+
       ^
       |
+------+---------------------------------------+
|      Amazon CloudWatch & Sentry              |
|      Logs, Metrics, Alarms, Distributed Trace|
+----------------------------------------------+
```

---

## 📋 Prerequisites

Before initiating provisioning, ensure your environment meets these requirements:

1. **AWS CLI v2** installed and configured:
   ```bash
   aws --version
   aws configure
   ```
2. **Docker Engine & Docker Compose**:
   ```bash
   docker --version
   docker compose version
   ```
3. **Node.js (>= 20)** and **pnpm (>= 9)**:
   ```bash
   node --version
   pnpm --version
   ```
4. **IAM Permissions**:
   The deployer role requires administrative access for ECS, ECR, Route 53, ALB, SSM, IAM, and CloudWatch.

---

## 🚀 Step-by-Step Production Setup

### 1. Create Amazon ECR Repositories

Create private container repositories for the backend monolith and Next.js admin portal with image scanning enabled:

```bash
# Set AWS Region
export AWS_REGION="ap-south-1"

# Create Backend ECR Repository
aws ecr create-repository \
  --repository-name cookii-backend \
  --image-tag-mutability MUTABLE \
  --image-scanning-configuration scanOnPush=true \
  --encryption-configuration encryptionType=AES256 \
  --region $AWS_REGION

# Create Admin ECR Repository
aws ecr create-repository \
  --repository-name cookii-admin \
  --image-tag-mutability MUTABLE \
  --image-scanning-configuration scanOnPush=true \
  --encryption-configuration encryptionType=AES256 \
  --region $AWS_REGION
```

---

### 2. Create ECS Cluster (AWS Fargate)

Create the serverless container cluster with Container Insights enabled:

```bash
aws ecs create-cluster \
  --cluster-name cookii-production \
  --settings name=containerInsights,value=enabled \
  --capacity-providers FARGATE FARGATE_SPOT \
  --default-capacity-provider-strategy capacityProvider=FARGATE,weight=1 \
  --region $AWS_REGION
```

Create the IAM Execution and Task Roles:

```bash
# Create execution role policy document
cat << 'EOF' > /tmp/ecs-assume-role.json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "Service": "ecs-tasks.amazonaws.com" },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

# Create Task Execution Role (used by ECS agent to pull images and read SSM parameters)
aws iam create-role \
  --role-name cookii-ecs-execution-role \
  --assume-role-policy-document file:///tmp/ecs-assume-role.json

# Attach AWS managed policy for task execution
aws iam attach-role-policy \
  --role-name cookii-ecs-execution-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy

# Attach SSM Parameter Store access policy
cat << 'EOF' > /tmp/ssm-read-policy.json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ssm:GetParameters",
        "ssm:GetParameter",
        "ssm:GetParametersByPath",
        "kms:Decrypt"
      ],
      "Resource": "*"
    }
  ]
}
EOF

aws iam put-role-policy \
  --role-name cookii-ecs-execution-role \
  --policy-name CookiiSSMReadSecretsPolicy \
  --policy-document file:///tmp/ssm-read-policy.json

# Create Task Role (used by running backend application to access S3 & SES)
aws iam create-role \
  --role-name cookii-ecs-task-role \
  --assume-role-policy-document file:///tmp/ecs-assume-role.json

cat << 'EOF' > /tmp/app-task-policy.json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::cookii-media-uploads-prod",
        "arn:aws:s3:::cookii-media-uploads-prod/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "ses:SendEmail",
        "ses:SendRawEmail"
      ],
      "Resource": "*"
    }
  ]
}
EOF

aws iam put-role-policy \
  --role-name cookii-ecs-task-role \
  --policy-name CookiiAppTaskRuntimePolicy \
  --policy-document file:///tmp/app-task-policy.json
```

---

### 3. Set Up MongoDB Atlas M10 Cluster

1. Navigate to **MongoDB Atlas Console** and create an **M10 dedicated tier** cluster in region `ap-south-1` (AWS Mumbai) for low latency.
2. In **Network Access**, configure VPC Peering or add your AWS NAT Gateway Elastic IP addresses to the IP Access List.
3. In **Database Access**, create the database user `cookii_app_user` with read/write access to `cookii_production`.
4. Copy the connection string format:
   ```text
   mongodb+srv://cookii_app_user:<PASSWORD>@cookii-prod.xxxxxx.mongodb.net/cookii_production?retryWrites=true&w=majority
   ```

---

### 4. Configure SSM Parameters for Secrets

Store production credentials securely in AWS Systems Manager Parameter Store as `SecureString` types:

```bash
# MongoDB Atlas Connection
aws ssm put-parameter \
  --name "/cookii/production/MONGODB_URI" \
  --type "SecureString" \
  --value "mongodb+srv://cookii_app_user:<PASSWORD>@cookii-prod.xxxxxx.mongodb.net/cookii_production?retryWrites=true&w=majority" \
  --overwrite

# Redis Host & Port
aws ssm put-parameter \
  --name "/cookii/production/REDIS_HOST" \
  --type "String" \
  --value "cookii-redis-prod.xxxxxx.0001.aps1.cache.amazonaws.com" \
  --overwrite

aws ssm put-parameter \
  --name "/cookii/production/REDIS_PORT" \
  --type "String" \
  --value "6379" \
  --overwrite

aws ssm put-parameter \
  --name "/cookii/production/REDIS_PASSWORD" \
  --type "SecureString" \
  --value "<REDIS_AUTH_TOKEN>" \
  --overwrite

aws ssm put-parameter \
  --name "/cookii/production/REDIS_TLS" \
  --type "String" \
  --value "true" \
  --overwrite

# JWT Secrets (Minimum 32 random characters)
aws ssm put-parameter \
  --name "/cookii/production/JWT_ACCESS_SECRET" \
  --type "SecureString" \
  --value "$(openssl rand -hex 32)" \
  --overwrite

aws ssm put-parameter \
  --name "/cookii/production/JWT_REFRESH_SECRET" \
  --type "SecureString" \
  --value "$(openssl rand -hex 32)" \
  --overwrite

aws ssm put-parameter \
  --name "/cookii/production/ADMIN_JWT_SECRET" \
  --type "SecureString" \
  --value "$(openssl rand -hex 32)" \
  --overwrite

# OTP SMS Provider (MSG91)
aws ssm put-parameter \
  --name "/cookii/production/OTP_PROVIDER" \
  --type "String" \
  --value "msg91" \
  --overwrite

aws ssm put-parameter \
  --name "/cookii/production/MSG91_AUTH_KEY" \
  --type "SecureString" \
  --value "<YOUR_MSG91_AUTH_KEY>" \
  --overwrite

aws ssm put-parameter \
  --name "/cookii/production/MSG91_TEMPLATE_ID" \
  --type "String" \
  --value "<YOUR_MSG91_TEMPLATE_ID>" \
  --overwrite

aws ssm put-parameter \
  --name "/cookii/production/MSG91_SENDER" \
  --type "String" \
  --value "COOKII" \
  --overwrite

# Razorpay Payments
aws ssm put-parameter \
  --name "/cookii/production/RAZORPAY_KEY_ID" \
  --type "SecureString" \
  --value "rzp_live_xxxxxxxxxxxxxx" \
  --overwrite

aws ssm put-parameter \
  --name "/cookii/production/RAZORPAY_KEY_SECRET" \
  --type "SecureString" \
  --value "<YOUR_RAZORPAY_KEY_SECRET>" \
  --overwrite

aws ssm put-parameter \
  --name "/cookii/production/RAZORPAY_WEBHOOK_SECRET" \
  --type "SecureString" \
  --value "<YOUR_RAZORPAY_WEBHOOK_SECRET>" \
  --overwrite

# S3 File Storage
aws ssm put-parameter \
  --name "/cookii/production/AWS_S3_BUCKET" \
  --type "String" \
  --value "cookii-media-uploads-prod" \
  --overwrite

# Sentry Monitoring
aws ssm put-parameter \
  --name "/cookii/production/SENTRY_DSN" \
  --type "SecureString" \
  --value "https://xxxxxxxx@o123456.ingest.sentry.io/7891011" \
  --overwrite
```

---

### 5. Create Application Load Balancer (ALB) with HTTPS Listener

1. **Request ACM TLS Certificate**:
   ```bash
   aws acm request-certificate \
     --domain-name "*.cookii.in" \
     --validation-method DNS \
     --subject-alternative-names "cookii.in" \
     --region $AWS_REGION
   ```
   Add the generated CNAME records in Route 53 to complete certificate verification.

2. **Create Target Groups**:
   ```bash
   # Backend Target Group (Port 4000)
   aws elbv2 create-target-group \
     --name tg-cookii-backend \
     --protocol HTTP \
     --port 4000 \
     --vpc-id <VPC_ID> \
     --target-type ip \
     --health-check-path /api/v1/health \
     --health-check-interval-seconds 30 \
     --healthy-threshold-count 2 \
     --unhealthy-threshold-count 3 \
     --region $AWS_REGION

   # Admin Target Group (Port 3000)
   aws elbv2 create-target-group \
     --name tg-cookii-admin \
     --protocol HTTP \
     --port 3000 \
     --vpc-id <VPC_ID> \
     --target-type ip \
     --health-check-path /api/health \
     --health-check-interval-seconds 30 \
     --healthy-threshold-count 2 \
     --unhealthy-threshold-count 3 \
     --region $AWS_REGION
   ```

3. **Configure ALB Routing Rules**:
   - Forward `api.cookii.in` to `tg-cookii-backend`
   - Forward `admin.cookii.in` to `tg-cookii-admin`
   - Redirect HTTP (port 80) to HTTPS (port 443)

---

### 6. Set Up Route 53 Records

In your Route 53 Hosted Zone for `cookii.in`:

```bash
# Create A (Alias) records pointing to the ALB DNS name
cat << 'EOF' > /tmp/route53-alb-alias.json
{
  "Comment": "Routing records for Cookii API and Admin",
  "Changes": [
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "api.cookii.in",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "<ALB_HOSTED_ZONE_ID>",
          "DNSName": "<ALB_DNS_NAME>",
          "EvaluateTargetHealth": true
        }
      }
    },
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "admin.cookii.in",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "<ALB_HOSTED_ZONE_ID>",
          "DNSName": "<ALB_DNS_NAME>",
          "EvaluateTargetHealth": true
        }
      }
    }
  ]
}
EOF

aws route53 change-resource-record-sets \
  --hosted-zone-id <ROUTE53_ZONE_ID> \
  --change-batch file:///tmp/route53-alb-alias.json
```

---

### 7. Configure Amazon SES for Email

Verify the domain identity in Amazon SES (`ap-south-1`):

```bash
# Verify Domain
aws ses verify-domain-identity --domain cookii.in --region $AWS_REGION

# Enable DKIM
aws ses verify-domain-dkim --domain cookii.in --region $AWS_REGION
```

Add the generated DKIM tokens as CNAME records in Route 53 and configure SPF:
```text
v=spf1 include:amazonses.com ~all
```

---

### 8. Set Up CloudWatch Alarms

Create proactive alarms for container metrics and API availability:

```bash
# 1. High CPU Utilization Alarm (> 80% for 2 consecutive periods)
aws cloudwatch put-metric-alarm \
  --alarm-name "cookii-backend-high-cpu" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 60 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=ClusterName,Value=cookii-production Name=ServiceName,Value=cookii-backend \
  --evaluation-periods 2 \
  --alarm-actions <SNS_TOPIC_ARN_FOR_ALERTS> \
  --region $AWS_REGION

# 2. High Memory Utilization Alarm (> 80%)
aws cloudwatch put-metric-alarm \
  --alarm-name "cookii-backend-high-memory" \
  --metric-name MemoryUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 60 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=ClusterName,Value=cookii-production Name=ServiceName,Value=cookii-backend \
  --evaluation-periods 2 \
  --alarm-actions <SNS_TOPIC_ARN_FOR_ALERTS> \
  --region $AWS_REGION

# 3. ALB 5XX Error Count (> 10 errors in 1 minute)
aws cloudwatch put-metric-alarm \
  --alarm-name "cookii-alb-high-5xx" \
  --metric-name HTTPCode_Target_5XX_Count \
  --namespace AWS/ApplicationELB \
  --statistic Sum \
  --period 60 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=LoadBalancer,Value=<LOAD_BALANCER_DIMENSION_ID> \
  --evaluation-periods 1 \
  --alarm-actions <SNS_TOPIC_ARN_FOR_ALERTS> \
  --region $AWS_REGION
```

---

## 🔑 Environment Variable Reference Table

| Variable | Required | Description | SSM Parameter Path | Example Value |
| :--- | :--- | :--- | :--- | :--- |
| `NODE_ENV` | Yes | Runtime environment | N/A (ECS Env) | `production` |
| `PORT` | Yes | Monolith HTTP listening port | N/A (ECS Env) | `4000` |
| `API_PREFIX` | Yes | URL route prefix | N/A (ECS Env) | `api/v1` |
| `MONGODB_URI` | Yes | MongoDB Atlas replica set URI | `/cookii/production/MONGODB_URI` | `mongodb+srv://...` |
| `REDIS_HOST` | Yes | ElastiCache Redis endpoint | `/cookii/production/REDIS_HOST` | `cookii-redis.xxx.cache.amazonaws.com` |
| `REDIS_PORT` | Yes | Redis service port | `/cookii/production/REDIS_PORT` | `6379` |
| `REDIS_PASSWORD`| Conditional | Redis AUTH token | `/cookii/production/REDIS_PASSWORD` | `<secure-token>` |
| `REDIS_TLS` | Yes | Enable in-transit encryption | `/cookii/production/REDIS_TLS` | `true` |
| `JWT_ACCESS_SECRET` | Yes | HMAC secret for access tokens | `/cookii/production/JWT_ACCESS_SECRET` | `32+ characters hex string` |
| `JWT_REFRESH_SECRET`| Yes | HMAC secret for refresh tokens | `/cookii/production/JWT_REFRESH_SECRET` | `32+ characters hex string` |
| `ADMIN_JWT_SECRET` | Yes | Secret for admin sessions | `/cookii/production/ADMIN_JWT_SECRET` | `32+ characters hex string` |
| `OTP_PROVIDER` | Yes | Phone verification backend | `/cookii/production/OTP_PROVIDER` | `msg91` |
| `MSG91_AUTH_KEY` | Yes | MSG91 SMS gateway auth key | `/cookii/production/MSG91_AUTH_KEY` | `398284...` |
| `MSG91_TEMPLATE_ID`| Yes | MSG91 DLT approved template ID | `/cookii/production/MSG91_TEMPLATE_ID`| `658a...` |
| `MSG91_SENDER` | Yes | 6-character DLT sender ID | `/cookii/production/MSG91_SENDER` | `COOKII` |
| `RAZORPAY_KEY_ID` | Yes | Razorpay Live API key | `/cookii/production/RAZORPAY_KEY_ID` | `rzp_live_...` |
| `RAZORPAY_KEY_SECRET`| Yes | Razorpay Live secret key | `/cookii/production/RAZORPAY_KEY_SECRET` | `<secret>` |
| `RAZORPAY_WEBHOOK_SECRET`| Yes | Webhook verification secret | `/cookii/production/RAZORPAY_WEBHOOK_SECRET`| `<wh-secret>` |
| `STORAGE_PROVIDER`| Yes | KYC & dish photo storage | N/A (ECS Env) | `s3` |
| `AWS_S3_BUCKET` | Yes | S3 bucket name | `/cookii/production/AWS_S3_BUCKET` | `cookii-media-uploads-prod` |
| `EMAIL_PROVIDER` | Yes | Transactional email provider | N/A (ECS Env) | `ses` |
| `AWS_SES_REGION` | Yes | SES AWS region | N/A (ECS Env) | `ap-south-1` |
| `AWS_SES_FROM_EMAIL`| Yes | Verified sender address | N/A (ECS Env) | `noreply@cookii.in` |
| `SENTRY_DSN` | No | Sentry error tracking DSN | `/cookii/production/SENTRY_DSN` | `https://...` |

---

## 📊 Monitoring & Observability

### 1. CloudWatch Dashboard
A unified monitoring dashboard displays:
- **P95 / P99 API Latency** by endpoint (`/api/v1/bookings`, `/api/v1/auth`, `/api/v1/matching`).
- **ECS Service CPU & Memory** consumption vs allocated units.
- **ALB Request Count & Target Response Time**.
- **Active WebSocket Connections** on `/socket.io/`.
- **4xx & 5xx Error Rate percentages**.

### 2. Sentry Error Tracking
- Uncaught exceptions in NestJS and Next.js are dispatched to Sentry with release tags corresponding to the Git commit SHA (`TAG=$(git rev-parse --short HEAD)`).
- Performance profiling and database query latency tracing are enabled in production.
