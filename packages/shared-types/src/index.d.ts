export declare enum UserRole {
    CUSTOMER = "CUSTOMER",
    COOK = "COOK",
    ADMIN = "ADMIN",
    OPS = "OPS"
}
export declare enum CookVerificationStatus {
    DRAFT = "DRAFT",
    SUBMITTED = "SUBMITTED",
    UNDER_REVIEW = "UNDER_REVIEW",
    VERIFIED = "VERIFIED",
    REJECTED = "REJECTED",
    SUSPENDED = "SUSPENDED"
}
export declare enum DocumentType {
    AADHAAR = "AADHAAR",
    PAN = "PAN",
    POLICE_VERIFICATION = "POLICE_VERIFICATION",
    FOOD_SAFETY_TRAINING = "FOOD_SAFETY_TRAINING",
    PROFILE_PHOTO = "PROFILE_PHOTO",
    KITCHEN_PHOTO = "KITCHEN_PHOTO"
}
export declare enum DocumentStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED"
}
export interface GeoLocation {
    type: 'Point';
    coordinates: [number, number];
}
export interface Address {
    id?: string;
    userId: string;
    label: string;
    tag?: string;
    fullAddress: string;
    landmark?: string;
    pincode: string;
    location: GeoLocation;
    isDefault: boolean;
    createdAt?: string | Date;
    updatedAt?: string | Date;
}
export declare enum ServiceType {
    BREAKFAST = "BREAKFAST",
    LUNCH = "LUNCH",
    DINNER = "DINNER",
    FULL_DAY = "FULL_DAY",
    PARTY_SPECIAL = "PARTY_SPECIAL"
}
export declare enum CuisineType {
    SOUTH_INDIAN = "SOUTH_INDIAN",
    NORTH_INDIAN = "NORTH_INDIAN",
    KARNATAKA_SPECIAL = "KARNATAKA_SPECIAL",
    BENGALI = "BENGALI",
    MAHARASHTRIAN = "MAHARASHTRIAN",
    CONTINENTAL = "CONTINENTAL",
    CHINESE = "CHINESE",
    JAIN_SPECIAL = "JAIN_SPECIAL",
    DIET_FITNESS = "DIET_FITNESS"
}
export interface PricingBreakdown {
    basePrice: number;
    perPersonAddOn: number;
    personCount: number;
    peakMultiplier: number;
    surgePrice: number;
    zoneMultiplier: number;
    platformFee: number;
    gstAmount: number;
    discountAmount: number;
    couponCode?: string;
    totalCustomerPayable: number;
    cookPayoutAmount: number;
    platformTakeRate: number;
}
export declare enum BookingStatus {
    CREATED = "CREATED",
    PAYMENT_PENDING = "PAYMENT_PENDING",
    SEARCHING = "SEARCHING",
    ASSIGNED = "ASSIGNED",
    EN_ROUTE = "EN_ROUTE",
    ARRIVED = "ARRIVED",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
    NO_SHOW = "NO_SHOW",
    REFUNDED = "REFUNDED"
}
export declare const VALID_BOOKING_TRANSITIONS: Record<BookingStatus, BookingStatus[]>;
export declare enum ActorType {
    CUSTOMER = "CUSTOMER",
    COOK = "COOK",
    ADMIN = "ADMIN",
    SYSTEM = "SYSTEM"
}
export interface BookingTimelineEvent {
    fromStatus?: BookingStatus;
    toStatus: BookingStatus;
    actor: ActorType;
    actorId?: string;
    reason?: string;
    timestamp: string | Date;
    metadata?: Record<string, unknown>;
}
export declare enum JobOfferStatus {
    PENDING = "PENDING",
    ACCEPTED = "ACCEPTED",
    DECLINED = "DECLINED",
    EXPIRED = "EXPIRED"
}
export interface JobOffer {
    id: string;
    bookingId: string;
    cookId: string;
    distanceKm: number;
    estimatedEarnings: number;
    status: JobOfferStatus;
    offeredAt: string | Date;
    expiresAt: string | Date;
    respondedAt?: string | Date;
}
export declare enum PaymentMethod {
    UPI = "UPI",
    CARD = "CARD",
    WALLET = "WALLET",
    CASH = "CASH"
}
export declare enum PaymentStatus {
    PENDING = "PENDING",
    AUTHORIZED = "AUTHORIZED",
    CAPTURED = "CAPTURED",
    FAILED = "FAILED",
    REFUNDED = "REFUNDED"
}
export declare enum LedgerEntryType {
    CREDIT = "CREDIT",
    DEBIT = "DEBIT"
}
export declare enum LedgerAccount {
    CUSTOMER_WALLET = "CUSTOMER_WALLET",
    COOK_WALLET = "COOK_WALLET",
    PLATFORM_ESCROW = "PLATFORM_ESCROW",
    PLATFORM_REVENUE = "PLATFORM_REVENUE",
    PAYMENT_GATEWAY_RECEIVABLE = "PAYMENT_GATEWAY_RECEIVABLE",
    TAX_PAYABLE = "TAX_PAYABLE"
}
export interface LedgerEntry {
    id: string;
    transactionId: string;
    account: LedgerAccount;
    userId?: string;
    type: LedgerEntryType;
    amount: number;
    balanceAfter: number;
    referenceId: string;
    description: string;
    createdAt: string | Date;
}
export declare enum SosAlertStatus {
    TRIGGERED = "TRIGGERED",
    ACKNOWLEDGED = "ACKNOWLEDGED",
    RESOLVED = "RESOLVED",
    FALSE_ALARM = "FALSE_ALARM"
}
export interface SosAlert {
    id: string;
    bookingId: string;
    triggeredBy: ActorType;
    userId: string;
    location: GeoLocation;
    status: SosAlertStatus;
    createdAt: string | Date;
    resolvedAt?: string | Date;
    resolutionNotes?: string;
}
export interface ApiSuccessResponse<T> {
    success: true;
    data: T;
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        timestamp?: string;
        correlationId?: string;
    };
}
export interface ApiErrorResponse {
    success: false;
    statusCode: number;
    message: string;
    error?: string;
    details?: unknown;
    timestamp: string;
    path: string;
    correlationId: string;
}
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
