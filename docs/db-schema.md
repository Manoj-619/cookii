# Cookii — Database Schema & Data Models Specification

**Database Engine:** MongoDB 7.0 / MongoDB Atlas (Mongoose ODM)  
**Geospatial Standard:** GeoJSON `Point` (`[longitude, latitude]`) with `2dsphere` index  
**Integrity Guarantees:** Soft Deletes, Strict Audit Timestamps, Optimistic Concurrency Control (`__v`), Immutable Financial Ledger

---

## 1. Entity Relationship (ER) Diagram

```mermaid
erDiagram
    USER ||--o{ ADDRESS : "has saved"
    USER ||--o| COOK_PROFILE : "has partner profile"
    COOK_PROFILE ||--o{ COOK_DOCUMENT : "has verification files"
    USER ||--o{ BOOKING : "places as customer"
    COOK_PROFILE ||--o{ BOOKING : "fulfills as cook"
    BOOKING ||--o{ BOOKING_TIMELINE : "logs transitions"
    BOOKING ||--o{ JOB_OFFER : "dispatches offers"
    BOOKING ||--o| PAYMENT_TRANSACTION : "settled via"
    BOOKING ||--o| REVIEW : "rated by"
    BOOKING ||--o{ CHAT_MESSAGE : "in-app messages"
    BOOKING ||--o{ SOS_ALERT : "safety triggers"
    USER ||--o{ WALLET_LEDGER : "has balance entries"
    PRICING_CONFIG ||--o{ BOOKING : "computes fare"
    COUPON ||--o{ BOOKING : "discounts fare"
    ADMIN_USER ||--o{ ADMIN_AUDIT_LOG : "actions recorded"

    USER {
        ObjectId _id PK
        string phone UK "Unique E.164 (+91)"
        string name "Full Name"
        string email "Optional"
        string role "CUSTOMER | COOK | ADMIN | OPS"
        boolean isPhoneVerified
        boolean isActive
        boolean isDeleted
        date createdAt
        date updatedAt
    }

    COOK_PROFILE {
        ObjectId _id PK
        ObjectId userId FK UK "Ref: User"
        string verificationStatus "DRAFT | SUBMITTED | UNDER_REVIEW | VERIFIED | REJECTED | SUSPENDED"
        boolean isOnline "Available for matching"
        boolean isBusy "Currently on a booking"
        Point currentLocation "GeoJSON Point [lng, lat] (2dsphere)"
        double serviceRadiusKm "Default 6.0 km"
        string[] cuisines "South Indian, North Indian, etc."
        string[] languages "Kannada, Hindi, English"
        double ratingAverage "e.g. 4.92"
        int totalRatingsCount "e.g. 142"
        int totalBookingsCompleted "e.g. 312"
        double acceptanceRate "e.g. 0.94"
        string bankUpiId "For instant daily payouts"
        date lastLocationUpdatedAt
    }

    COOK_DOCUMENT {
        ObjectId _id PK
        ObjectId cookId FK "Ref: CookProfile"
        string documentType "AADHAAR | PAN | POLICE_VERIFICATION | PHOTO"
        string documentNumber "Masked string"
        string fileUrl "Cloudinary signed URL"
        string status "PENDING | APPROVED | REJECTED"
        string rejectionReason
        ObjectId verifiedBy FK "Ref: User (Admin)"
        date verifiedAt
    }

    ADDRESS {
        ObjectId _id PK
        ObjectId userId FK "Ref: User"
        string label "Home | Work | Parents | Other"
        string fullAddress "Complete street & apartment info"
        string landmark "e.g. Near Sony Signal"
        string pincode "Bengaluru 560xxx"
        Point location "GeoJSON Point [lng, lat] (2dsphere)"
        boolean isDefault
        boolean isDeleted
    }

    BOOKING {
        ObjectId _id PK
        string bookingNumber UK "e.g. CK-202611-8492"
        ObjectId customerId FK "Ref: User"
        ObjectId cookId FK "Ref: CookProfile (nullable until assigned)"
        ObjectId addressId FK "Ref: Address"
        string serviceType "BREAKFAST | LUNCH | DINNER | FULL_DAY"
        string[] cuisinesSelected
        int personCount
        string dietaryNotes
        date scheduledStartTime
        date scheduledEndTime
        string status "CREATED | PAYMENT_PENDING | SEARCHING | ASSIGNED | EN_ROUTE | ARRIVED | IN_PROGRESS | COMPLETED | CANCELLED | NO_SHOW | REFUNDED"
        string startOtpHash "Bcrypt hash of 4-digit code"
        PricingBreakdown pricing
        string paymentMethod "UPI | CARD | WALLET | CASH"
        string paymentStatus "PENDING | AUTHORIZED | CAPTURED | FAILED | REFUNDED"
        date actualStartTime
        date actualEndTime
        boolean isDeleted
    }

    BOOKING_TIMELINE {
        ObjectId _id PK
        ObjectId bookingId FK "Ref: Booking"
        string fromStatus
        string toStatus
        string actor "CUSTOMER | COOK | ADMIN | SYSTEM"
        ObjectId actorId
        string reason
        object metadata
        date timestamp
    }

    JOB_OFFER {
        ObjectId _id PK
        ObjectId bookingId FK "Ref: Booking"
        ObjectId cookId FK "Ref: CookProfile"
        double distanceKm
        double estimatedEarnings
        string status "PENDING | ACCEPTED | DECLINED | EXPIRED"
        date offeredAt
        date expiresAt "TTL index"
        date respondedAt
    }

    WALLET_LEDGER {
        ObjectId _id PK
        string transactionId UK "Unique idempotency UUID"
        ObjectId userId FK "Ref: User"
        string account "CUSTOMER_WALLET | COOK_WALLET | PLATFORM_ESCROW | PLATFORM_REVENUE | TAX_PAYABLE"
        string type "CREDIT | DEBIT"
        double amount
        double balanceAfter
        string referenceType "BOOKING | TOPUP | PAYOUT | REFUND | PENALTY"
        string referenceId
        string description
        date createdAt
    }

    REVIEW {
        ObjectId _id PK
        ObjectId bookingId FK UK "Ref: Booking"
        ObjectId customerId FK "Ref: User"
        ObjectId cookId FK "Ref: CookProfile"
        int rating "1 to 5"
        string[] tags "Punctual, Super Clean, Delicious"
        string comment
        double tipAmount
        date createdAt
    }

    SOS_ALERT {
        ObjectId _id PK
        ObjectId bookingId FK "Ref: Booking"
        ObjectId triggeredBy FK "Ref: User"
        string actorType "CUSTOMER | COOK"
        Point location "GeoJSON Point [lng, lat]"
        string status "TRIGGERED | ACKNOWLEDGED | RESOLVED | FALSE_ALARM"
        ObjectId acknowledgedBy FK "Ref: User (Ops)"
        string resolutionNotes
        date createdAt
        date resolvedAt
    }
```

---

## 2. Detailed Collection Schemas & Index Strategy

### 2.1 Collection: `users`
Represents all system actors (Customers, Cooks, Admins, Ops).
```typescript
{
  _id: ObjectId,
  phone: String,            // +919876543210 (E.164)
  name: String,             // "Arjun Rao"
  email: String,            // nullable, lowercase
  role: String,             // 'CUSTOMER' | 'COOK' | 'ADMIN' | 'OPS'
  isPhoneVerified: Boolean, // default false
  deviceTokens: [String],   // FCM tokens for push notifications
  refreshTokenHash: String, // Argon2/Bcrypt hash for rotating refresh tokens
  tokenVersion: Number,     // Token invalidation counter
  isDeleted: Boolean,       // default false (soft delete)
  deletedAt: Date,          // nullable
  createdAt: Date,
  updatedAt: Date
}
```
**Indexes:**
- `{ phone: 1 }` (Unique, partialFilter: `{ isDeleted: false }`)
- `{ email: 1 }` (Sparse, Unique)
- `{ role: 1, isDeleted: 1 }`

---

### 2.2 Collection: `cook_profiles`
Maintains operational details, live geolocation, verification state, and service capability.
```typescript
{
  _id: ObjectId,
  userId: ObjectId,                // Ref: users
  verificationStatus: String,     // 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED'
  rejectionReason: String,
  isOnline: Boolean,              // Partner toggled online for jobs
  isBusy: Boolean,                // Locked during an active booking
  currentLocation: {
    type: "Point",
    coordinates: [Number, Number] // [77.6245, 12.9352] (Koramangala, Bengaluru)
  },
  lastLocationUpdatedAt: Date,
  serviceRadiusKm: Number,        // Default: 6.0 km
  cuisines: [String],             // ['SOUTH_INDIAN', 'KARNATAKA_SPECIAL', 'NORTH_INDIAN']
  languages: [String],            // ['Kannada', 'Hindi', 'English']
  specialtyDishes: [String],      // ['Ragi Mudde', 'Bisi Bele Bath', 'Paneer Butter Masala']
  ratingAverage: Number,          // Default 5.0 (4.92)
  totalRatingsCount: Number,      // Default 0
  totalBookingsCompleted: Number, // Default 0
  acceptanceRate: Number,         // Default 1.0 (98%)
  bankUpiId: String,              // "cooksita@oksbi"
  policeVerificationCertUrl: String,
  verifiedAt: Date,
  verifiedBy: ObjectId,           // Ref: users (Admin)
  isDeleted: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```
**Indexes:**
- `{ currentLocation: '2dsphere' }` (Critical for geospatial matching `$near` within radius)
- `{ userId: 1 }` (Unique)
- `{ verificationStatus: 1, isOnline: 1, isBusy: 1 }` (Fast candidate query index)
- `{ ratingAverage: -1 }` (Used in ranking stage)

---

### 2.3 Collection: `addresses`
Saved customer locations with precise GPS coordinates.
```typescript
{
  _id: ObjectId,
  userId: ObjectId,        // Ref: users
  label: String,           // 'Home' | 'Work' | 'Other'
  fullAddress: String,     // 'Flat 304, Green Glen Layout, Outer Ring Road'
  landmark: String,        // 'Opposite Central Mall Bellandur'
  pincode: String,         // '560103'
  location: {
    type: "Point",
    coordinates: [Number, Number] // [77.6744, 12.9299] (Bellandur)
  },
  isDefault: Boolean,      // default false
  isDeleted: Boolean,      // default false
  createdAt: Date,
  updatedAt: Date
}
```
**Indexes:**
- `{ location: '2dsphere' }`
- `{ userId: 1, isDefault: -1 }`
- `{ userId: 1, isDeleted: 1 }`

---

### 2.4 Collection: `bookings`
Core transaction entity driven by a strict state machine.
```typescript
{
  _id: ObjectId,
  bookingNumber: String,       // 'CK-202611-8492' (Human-friendly)
  customerId: ObjectId,        // Ref: users
  cookId: ObjectId,            // Ref: cook_profiles (nullable initially)
  addressId: ObjectId,         // Ref: addresses
  serviceType: String,         // 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'FULL_DAY'
  cuisinesSelected: [String],  // ['SOUTH_INDIAN']
  personCount: Number,         // 1 to 10
  dietaryNotes: String,        // 'Less oil, no sugar in tea'
  scheduledStartTime: Date,    // Target slot time
  scheduledEndTime: Date,
  status: String,              // 'CREATED' | 'PAYMENT_PENDING' | 'SEARCHING' | 'ASSIGNED' | 'EN_ROUTE' | 'ARRIVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW' | 'REFUNDED'
  cancellationReason: String,
  cancelledBy: String,         // 'CUSTOMER' | 'COOK' | 'ADMIN' | 'SYSTEM'
  startOtpHash: String,        // Bcrypt hash of 4-digit start OTP
  pricing: {
    basePrice: Number,         // e.g. 299
    perPersonAddOn: Number,    // e.g. 50 * 2 = 100
    peakMultiplier: Number,    // e.g. 1.15
    surgePrice: Number,        // e.g. 45
    platformFee: Number,       // e.g. 25
    gstAmount: Number,         // e.g. 23 (5%)
    discountAmount: Number,    // e.g. 50 (Coupon applied)
    couponCode: String,        // e.g. 'NAMMACOOKII'
    totalCustomerPayable: Number, // e.g. 442
    cookPayoutAmount: Number,  // e.g. 350
    platformTakeRate: Number   // e.g. 0.20
  },
  paymentMethod: String,       // 'UPI' | 'CARD' | 'WALLET' | 'CASH'
  paymentStatus: String,       // 'PENDING' | 'CAPTURED' | 'FAILED' | 'REFUNDED'
  paymentTransactionId: String,// Razorpay order/payment id
  actualStartTime: Date,
  actualEndTime: Date,
  isDeleted: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```
**Indexes:**
- `{ bookingNumber: 1 }` (Unique)
- `{ customerId: 1, status: 1, scheduledStartTime: -1 }` (Customer history query)
- `{ cookId: 1, status: 1, scheduledStartTime: -1 }` (Cook active booking query)
- `{ status: 1, scheduledStartTime: 1 }` (Ops and background job scheduler query)

---

### 2.5 Collection: `booking_timelines`
Immutable audit log tracking every single status transition.
```typescript
{
  _id: ObjectId,
  bookingId: ObjectId,      // Ref: bookings
  fromStatus: String,       // 'SEARCHING'
  toStatus: String,         // 'ASSIGNED'
  actor: String,            // 'CUSTOMER' | 'COOK' | 'ADMIN' | 'SYSTEM'
  actorId: ObjectId,        // User/Cook ID
  reason: String,           // 'Accepted by Sita Lakshmi within 18s'
  metadata: Object,         // { responseTimeSeconds: 18, batteryLevel: 85 }
  timestamp: Date           // Indexed for chronological ordering
}
```
**Indexes:**
- `{ bookingId: 1, timestamp: 1 }`

---

### 2.6 Collection: `job_offers`
Manages transient 20-30s dispatch offers to eligible cooks.
```typescript
{
  _id: ObjectId,
  bookingId: ObjectId,         // Ref: bookings
  cookId: ObjectId,            // Ref: cook_profiles
  distanceKm: Number,          // 2.3
  estimatedEarnings: Number,   // 350
  status: String,              // 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED'
  offeredAt: Date,             // Offer creation timestamp
  expiresAt: Date,             // offeredAt + 25 seconds
  respondedAt: Date
}
```
**Indexes:**
- `{ expiresAt: 1 }` (TTL Index: Automatically removes documents after expiration if required)
- `{ bookingId: 1, cookId: 1 }` (Compound Unique to prevent duplicate offers)
- `{ cookId: 1, status: 1 }`

---

### 2.7 Collection: `wallet_ledgers` (Double-Entry Financial Accounting)
Guarantees financial integrity: balances are computed from immutable credit/debit records.
```typescript
{
  _id: ObjectId,
  transactionId: String,   // Unique UUID for idempotency
  userId: ObjectId,        // Ref: users (Customer or Cook)
  account: String,         // 'CUSTOMER_WALLET' | 'COOK_WALLET' | 'PLATFORM_ESCROW' | 'PLATFORM_REVENUE' | 'TAX_PAYABLE'
  type: String,            // 'CREDIT' | 'DEBIT'
  amount: Number,          // Strictly positive floating point (e.g. 350.00)
  balanceAfter: Number,    // Snapshot of account balance after this ledger entry
  referenceType: String,   // 'BOOKING_PAYOUT' | 'BOOKING_PAYMENT' | 'TOPUP' | 'REFUND' | 'PENALTY'
  referenceId: String,     // Booking ID or Razorpay Payment ID
  description: String,     // 'Payout for booking CK-202611-8492'
  createdAt: Date          // Immutable (No updatedAt)
}
```
**Indexes:**
- `{ transactionId: 1 }` (Unique Idempotency Index)
- `{ userId: 1, createdAt: -1 }` (User statement query)
- `{ referenceId: 1, referenceType: 1 }` (Transaction trace query)

---

### 2.8 Collection: `sos_alerts`
High-priority safety and distress mechanism.
```typescript
{
  _id: ObjectId,
  bookingId: ObjectId,       // Ref: bookings
  triggeredBy: ObjectId,     // Ref: users
  actorType: String,         // 'CUSTOMER' | 'COOK'
  location: {
    type: "Point",
    coordinates: [Number, Number]
  },
  status: String,            // 'TRIGGERED' | 'ACKNOWLEDGED' | 'RESOLVED' | 'FALSE_ALARM'
  acknowledgedBy: ObjectId,  // Ref: users (Ops/Admin)
  resolutionNotes: String,
  createdAt: Date,
  resolvedAt: Date
}
```
**Indexes:**
- `{ status: 1, createdAt: -1 }` (Critical for live ops safety monitor banner)
- `{ bookingId: 1 }`

---

### 2.9 Collection: `pricing_configs`
Config-driven pricing engine for Bengaluru zones.
```typescript
{
  _id: ObjectId,
  zoneName: String,             // 'Bengaluru Urban - Central (Koramangala, Indiranagar, HSR)'
  pincodes: [String],           // ['560034', '560038', '560102', ...]
  serviceRates: {
    BREAKFAST: { baseFare: 249, basePersons: 2, perExtraPerson: 40, estimatedMinutes: 60 },
    LUNCH: { baseFare: 299, basePersons: 2, perExtraPerson: 50, estimatedMinutes: 75 },
    DINNER: { baseFare: 329, basePersons: 2, perExtraPerson: 50, estimatedMinutes: 75 },
    FULL_DAY: { baseFare: 899, basePersons: 2, perExtraPerson: 100, estimatedMinutes: 240 }
  },
  peakHours: [
    { startHour: 7, endHour: 10, multiplier: 1.15, label: 'Morning Rush' },
    { startHour: 19, endHour: 21, multiplier: 1.20, label: 'Dinner Rush' }
  ],
  cookPayoutPercentage: 0.80,   // 80% to Cook, 20% Platform
  gstRate: 0.05,                // 5% GST on home food services
  cancellationFee: {
    gracePeriodMinutes: 5,      // Free cancellation within 5 mins
    cookAssignedFee: 50,        // ₹50 fee if cancelled after cook assignment
    enRouteFee: 100             // ₹100 fee if cook is already en route
  },
  isActive: Boolean,
  updatedBy: ObjectId,
  updatedAt: Date
}
```

