export type BookingStatusType =
  | 'UPCOMING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'SEARCHING'
  | 'ASSIGNED';

export type CookVerificationStatusType =
  | 'VERIFIED'
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'REJECTED'
  | 'SUSPENDED';

export type DocumentStatusType = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAvatar?: string;
  cookId?: string;
  cookName?: string;
  cookPhone?: string;
  cookAvatar?: string;
  serviceType: string;
  cuisine: string;
  date: string;
  timeSlot: string;
  status: BookingStatusType;
  amount: number;
  locality: string;
  address: string;
  pax: number;
  paymentStatus: 'CAPTURED' | 'PENDING' | 'REFUNDED' | 'FAILED';
  rating?: number;
  notes?: string;
  createdAt: string;
}

export interface CookDocument {
  id: string;
  type: 'AADHAAR' | 'PAN' | 'POLICE_VERIFICATION' | 'FOOD_SAFETY_TRAINING' | 'KITCHEN_PHOTO';
  title: string;
  documentNumber?: string;
  status: DocumentStatusType;
  fileUrl: string;
  uploadedAt: string;
  verifiedAt?: string;
  rejectionReason?: string;
}

export interface Cook {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  status: CookVerificationStatusType;
  rating: number;
  reviewCount: number;
  totalJobs: number;
  joinedDate: string;
  languages: string[];
  cuisines: string[];
  zone: string;
  experienceYears: number;
  isOnline: boolean;
  isAvailable: boolean;
  documents: CookDocument[];
  earnings: {
    total: number;
    thisMonth: number;
    pendingPayout: number;
    bankName: string;
    accountNumberLast4: string;
  };
  recentBookings?: Booking[];
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  bookingsCount: number;
  walletBalance: number;
  joinedDate: string;
  lastActive: string;
  locality: string;
  totalSpent: number;
}

export type PaymentType = 'BOOKING_PAYMENT' | 'WALLET_TOPUP' | 'REFUND';

export interface PaymentTransaction {
  id: string;
  razorpayPaymentId: string;
  bookingId?: string;
  customerId: string;
  customerName: string;
  type: PaymentType;
  amount: number;
  method: 'UPI' | 'CARD' | 'WALLET' | 'NETBANKING';
  status: 'CAPTURED' | 'PENDING' | 'REFUNDED' | 'FAILED';
  createdAt: string;
  description: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountPercent?: number;
  discountFlat?: number;
  minOrderValue: number;
  maxDiscount?: number;
  expiryDate: string;
  usageLimit: number;
  timesUsed: number;
  isActive: boolean;
  createdAt: string;
  description: string;
}

export interface RevenueDataPoint {
  day: string;
  revenue: number;
  bookingsCount: number;
}

export interface DashboardMetrics {
  totalBookings: number;
  totalBookingsTrend: number;
  activeNow: number;
  todayRevenue: number;
  todayRevenueTrend: number;
  cooksOnline: number;
  cooksTotal: number;
  revenueChart: RevenueDataPoint[];
  zoneBreakdown: {
    zone: string;
    activeCooks: number;
    liveBookings: number;
    todayGmv: number;
  }[];
}
