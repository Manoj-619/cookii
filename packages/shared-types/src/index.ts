/**
 * Cookii Shared Domain Types and Enums
 * Production-grade home cook booking platform for Bengaluru, India
 */

// ==========================================
// User & Auth
// ==========================================

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  COOK = 'COOK',
  ADMIN = 'ADMIN',
  OPS = 'OPS',
}

export enum CookVerificationStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  SUSPENDED = 'SUSPENDED',
}

export enum DocumentType {
  AADHAAR = 'AADHAAR',
  PAN = 'PAN',
  POLICE_VERIFICATION = 'POLICE_VERIFICATION',
  FOOD_SAFETY_TRAINING = 'FOOD_SAFETY_TRAINING',
  PROFILE_PHOTO = 'PROFILE_PHOTO',
  KITCHEN_PHOTO = 'KITCHEN_PHOTO',
}

export enum DocumentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface GeoLocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface Address {
  id?: string;
  userId: string;
  label: string; // 'Home', 'Work', 'Other'
  tag?: string; // 'Flat 402, Green Glen Layout, Bellandur'
  fullAddress: string;
  landmark?: string;
  pincode: string;
  location: GeoLocation;
  isDefault: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

// ==========================================
// Service & Pricing
// ==========================================

export enum ServiceType {
  BREAKFAST = 'BREAKFAST',
  LUNCH = 'LUNCH',
  DINNER = 'DINNER',
  FULL_DAY = 'FULL_DAY',
  PARTY_SPECIAL = 'PARTY_SPECIAL',
}

export enum CuisineType {
  SOUTH_INDIAN = 'SOUTH_INDIAN',
  NORTH_INDIAN = 'NORTH_INDIAN',
  KARNATAKA_SPECIAL = 'KARNATAKA_SPECIAL',
  BENGALI = 'BENGALI',
  MAHARASHTRIAN = 'MAHARASHTRIAN',
  CONTINENTAL = 'CONTINENTAL',
  CHINESE = 'CHINESE',
  JAIN_SPECIAL = 'JAIN_SPECIAL',
  DIET_FITNESS = 'DIET_FITNESS',
}

export interface PricingBreakdown {
  basePrice: number;
  perPersonAddOn: number;
  personCount: number;
  peakMultiplier: number;
  surgePrice: number;
  zoneMultiplier: number;
  platformFee: number;
  gstAmount: number; // 5% or 18% depending on tax slab
  discountAmount: number;
  couponCode?: string;
  totalCustomerPayable: number;
  cookPayoutAmount: number;
  platformTakeRate: number;
}

// ==========================================
// Booking & State Machine
// ==========================================

export enum BookingStatus {
  CREATED = 'CREATED',
  PAYMENT_PENDING = 'PAYMENT_PENDING',
  SEARCHING = 'SEARCHING',
  ASSIGNED = 'ASSIGNED',
  EN_ROUTE = 'EN_ROUTE',
  ARRIVED = 'ARRIVED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
  REFUNDED = 'REFUNDED',
}

/**
 * Valid state machine transitions table
 */
export const VALID_BOOKING_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  [BookingStatus.CREATED]: [BookingStatus.PAYMENT_PENDING, BookingStatus.CANCELLED],
  [BookingStatus.PAYMENT_PENDING]: [BookingStatus.SEARCHING, BookingStatus.CANCELLED],
  [BookingStatus.SEARCHING]: [BookingStatus.ASSIGNED, BookingStatus.CANCELLED],
  [BookingStatus.ASSIGNED]: [BookingStatus.EN_ROUTE, BookingStatus.CANCELLED, BookingStatus.SEARCHING], // reassignment
  [BookingStatus.EN_ROUTE]: [BookingStatus.ARRIVED, BookingStatus.CANCELLED, BookingStatus.NO_SHOW],
  [BookingStatus.ARRIVED]: [BookingStatus.IN_PROGRESS, BookingStatus.CANCELLED, BookingStatus.NO_SHOW],
  [BookingStatus.IN_PROGRESS]: [BookingStatus.COMPLETED, BookingStatus.CANCELLED],
  [BookingStatus.COMPLETED]: [BookingStatus.REFUNDED],
  [BookingStatus.CANCELLED]: [BookingStatus.REFUNDED],
  [BookingStatus.NO_SHOW]: [BookingStatus.REFUNDED],
  [BookingStatus.REFUNDED]: [],
};

export enum ActorType {
  CUSTOMER = 'CUSTOMER',
  COOK = 'COOK',
  ADMIN = 'ADMIN',
  SYSTEM = 'SYSTEM',
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

// ==========================================
// Matching & Job Offers
// ==========================================

export enum JobOfferStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  EXPIRED = 'EXPIRED',
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

// ==========================================
// Payments & Wallet Ledger (Double-Entry)
// ==========================================

export enum PaymentMethod {
  UPI = 'UPI',
  CARD = 'CARD',
  WALLET = 'WALLET',
  CASH = 'CASH',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  AUTHORIZED = 'AUTHORIZED',
  CAPTURED = 'CAPTURED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum LedgerEntryType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
}

export enum LedgerAccount {
  CUSTOMER_WALLET = 'CUSTOMER_WALLET',
  COOK_WALLET = 'COOK_WALLET',
  PLATFORM_ESCROW = 'PLATFORM_ESCROW',
  PLATFORM_REVENUE = 'PLATFORM_REVENUE',
  PAYMENT_GATEWAY_RECEIVABLE = 'PAYMENT_GATEWAY_RECEIVABLE',
  TAX_PAYABLE = 'TAX_PAYABLE',
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

// ==========================================
// Safety & Realtime
// ==========================================

export enum SosAlertStatus {
  TRIGGERED = 'TRIGGERED',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  RESOLVED = 'RESOLVED',
  FALSE_ALARM = 'FALSE_ALARM',
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

// ==========================================
// API Standard Response Envelope
// ==========================================

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

