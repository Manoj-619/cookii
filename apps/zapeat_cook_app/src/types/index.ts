export type JobOfferStatus = 'pending' | 'accepted' | 'declined' | 'expired';

export interface JobOffer {
  id: string;
  customerName: string;
  customerArea: string;
  fullAddress?: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';
  durationMinutes: number;
  earnings: number;
  requestedTime: string;
  date: string;
  dishes: string[];
  expiresInSeconds: number; // initial seconds (e.g. 25)
  receivedAt: string;
  status: JobOfferStatus;
}

export type ActiveJobStatus = 'accepted' | 'on_the_way' | 'arrived' | 'cooking' | 'completed';

export interface ActiveJob {
  id: string;
  customerName: string;
  customerPhone: string;
  customerArea: string;
  fullAddress: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';
  durationMinutes: number;
  earnings: number;
  scheduledTime: string;
  date: string;
  dishes: string[];
  status: ActiveJobStatus;
  startedAt?: string;
}

export interface CompletedJob {
  id: string;
  customerName: string;
  customerArea: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';
  completedAt: string;
  durationMinutes: number;
  earnings: number;
  rating?: number;
  tip?: number;
}

export interface EarningsTransaction {
  id: string;
  title: string;
  amount: number;
  type: 'credit' | 'payout' | 'tip';
  date: string;
  bookingRef?: string;
  status: 'Completed' | 'Pending' | 'Processing';
}

export interface ScheduleSlot {
  id: string;
  timeSlot: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner';
  area?: string;
  customerName?: string;
  status: 'booked' | 'available' | 'blocked';
  bookingId?: string;
}

export type KycStatus = 'VERIFIED' | 'PENDING' | 'UNDER_REVIEW';

export interface BankAccountInfo {
  accountHolder: string;
  bankName: string;
  accountNumberMasked: string;
  ifsc: string;
  isVerified: boolean;
}

export interface CookProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatarInitials: string;
  rating: number;
  totalBookings: number;
  kycStatus: KycStatus;
  experienceYears: number;
  languages: string[];
  cuisines: string[];
  bankAccount: BankAccountInfo;
}
