#!/usr/bin/env bash
# ==============================================================================
# ZapEat AWS Deployment Script
# Production-ready CI/CD and manual deployment automation for ECS Fargate
#
# Usage:
#   ./deploy.sh [backend|admin] [staging|production] [--wait]
#
# Examples:
#   ./deploy.sh backend staging
#   ./deploy.sh backend production --wait
#   ./deploy.sh admin production
# ==============================================================================

set -euo pipefail

# ------------------------------------------------------------------------------
# Configuration & Arguments
# ------------------------------------------------------------------------------
APP="${1:-backend}"
ENV="${2:-staging}"
WAIT_FLAG="${3:-}"

AWS_REGION="${AWS_REGION:-ap-south-1}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Styling
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

log_info() {
  echo -e "${BLUE}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') $1"
}

log_success() {
  echo -e "${GREEN}[SUCCESS]${NC} $(date '+%Y-%m-%d %H:%M:%S') $1"
}

log_warn() {
  echo -e "${YELLOW}[WARN]${NC} $(date '+%Y-%m-%d %H:%M:%S') $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') $1" >&2
}

# ------------------------------------------------------------------------------
# Input Validation
# ------------------------------------------------------------------------------
if [[ "$APP" != "backend" && "$APP" != "admin" ]]; then
  log_error "Invalid target application: '$APP'. Expected 'backend' or 'admin'."
  echo "Usage: $0 [backend|admin] [staging|production] [--wait]"
  exit 1
fi

if [[ "$ENV" != "staging" && "$ENV" != "production" ]]; then
  log_error "Invalid target environment: '$ENV'. Expected 'staging' or 'production'."
  echo "Usage: $0 [backend|admin] [staging|production] [--wait]"
  exit 1
fi

# Verify required CLI tools
for cmd in aws docker git; do
  if ! command -v "$cmd" &>/dev/null; then
    log_error "Required tool '$cmd' is not installed or not in PATH."
    exit 1
  fi
done

# ------------------------------------------------------------------------------
# AWS Account Identification & ECR Setup
# ------------------------------------------------------------------------------
log_info "Verifying AWS credentials and target account..."
if [[ -z "${AWS_ACCOUNT_ID:-}" ]]; then
  AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text 2>/dev/null || true)
  if [[ -z "$AWS_ACCOUNT_ID" || "$AWS_ACCOUNT_ID" == "None" ]]; then
    log_error "Could not determine AWS Account ID. Please authenticate with AWS CLI or set AWS_ACCOUNT_ID."
    exit 1
  fi
fi

REPO_NAME="ZapEat-$APP"
ECR_REGISTRY="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"
ECR_REPO="$ECR_REGISTRY/$REPO_NAME"

# Git commit short SHA for immutable tagging
TAG=$(git -C "$ROOT_DIR" rev-parse --short HEAD 2>/dev/null || echo "manual-$(date +%s)")

log_info "=========================================================="
log_info " ZapEat AWS Deployment Initiated"
log_info " Target App     : $APP"
log_info " Environment    : $ENV"
log_info " AWS Region     : $AWS_REGION"
log_info " AWS Account    : $AWS_ACCOUNT_ID"
log_info " ECR Repository : $ECR_REPO"
log_info " Image Tag      : $TAG"
log_info " Project Root   : $ROOT_DIR"
log_info "=========================================================="

# Ensure ECR repository exists
log_info "Checking if ECR repository '$REPO_NAME' exists..."
if ! aws ecr describe-repositories --repository-names "$REPO_NAME" --region "$AWS_REGION" &>/dev/null; then
  log_warn "ECR repository '$REPO_NAME' not found. Creating repository..."
  aws ecr create-repository \
    --repository-name "$REPO_NAME" \
    --image-tag-mutability MUTABLE \
    --image-scanning-configuration scanOnPush=true \
    --encryption-configuration encryptionType=AES256 \
    --region "$AWS_REGION" >/dev/null
  log_success "Created ECR repository: $REPO_NAME"
fi

# ------------------------------------------------------------------------------
# ECR Authentication
# ------------------------------------------------------------------------------
log_info "Authenticating Docker with Amazon ECR ($AWS_REGION)..."
aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "$ECR_REGISTRY"
log_success "Docker authenticated with ECR."

# ------------------------------------------------------------------------------
# Build Docker Image
# Context: Root monorepo directory to include shared packages and pnpm workspaces
# ------------------------------------------------------------------------------
DOCKERFILE_PATH="$ROOT_DIR/apps/$APP/Dockerfile"
if [[ ! -f "$DOCKERFILE_PATH" ]]; then
  log_error "Dockerfile not found at expected location: $DOCKERFILE_PATH"
  exit 1
fi

log_info "Building Docker image for $APP using monorepo context..."
docker build \
  -t "$ECR_REPO:$TAG" \
  -t "$ECR_REPO:latest" \
  -f "$DOCKERFILE_PATH" \
  "$ROOT_DIR"

log_success "Docker image built successfully with tags: [$TAG, latest]"

# ------------------------------------------------------------------------------
# Push Docker Image to Amazon ECR
# ------------------------------------------------------------------------------
log_info "Pushing Docker image: $ECR_REPO:$TAG"
docker push "$ECR_REPO:$TAG"

log_info "Pushing Docker image: $ECR_REPO:latest"
docker push "$ECR_REPO:latest"
log_success "Images pushed to ECR."

# ------------------------------------------------------------------------------
# Trigger ECS Rolling Deployment
# ------------------------------------------------------------------------------
CLUSTER_NAME="ZapEat-$ENV"
SERVICE_NAME="ZapEat-$APP"

log_info "Triggering ECS service deployment on cluster '$CLUSTER_NAME' for service '$SERVICE_NAME'..."

aws ecs update-service \
  --cluster "$CLUSTER_NAME" \
  --service "$SERVICE_NAME" \
  --force-new-deployment \
  --region "$AWS_REGION" \
  --output json > /dev/null

log_success "ECS service '$SERVICE_NAME' update triggered on cluster '$CLUSTER_NAME'."

# ------------------------------------------------------------------------------
# Wait for Service Stability (Optional / CLI Flag)
# ------------------------------------------------------------------------------
if [[ "$WAIT_FLAG" == "--wait" || "${WAIT_FOR_STABILITY:-false}" == "true" ]]; then
  log_info "Waiting for ECS service '$SERVICE_NAME' to reach steady state..."
  aws ecs wait services-stable \
    --cluster "$CLUSTER_NAME" \
    --services "$SERVICE_NAME" \
    --region "$AWS_REGION"
  log_success "ECS service '$SERVICE_NAME' reached steady state."
fi

log_success "=========================================================="
log_success " Successfully deployed $APP to $ENV!"
log_success " Commit SHA : $TAG"
log_success " ECR Image  : $ECR_REPO:$TAG"
log_success " Timestamp  : $(date '+%Y-%m-%d %H:%M:%S %Z')"
log_success "=========================================================="
