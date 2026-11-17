import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ActiveJob,
  CompletedJob,
  CookProfile,
  EarningsTransaction,
  JobOffer,
  ScheduleSlot,
} from '../types';
import {
  mockProfile,
  initialPendingOffers,
  initialActiveJobs,
  initialCompletedJobs,
  initialScheduleSlots,
  initialTransactions,
} from '../data/mockCookData';
import { sendCookOtp, verifyCookOtp } from '../services/auth';
import { configureApiClient } from '../services/api';

const storage = createJSONStorage(() => AsyncStorage);
const config = { version: 1, storage, migrate: (state: unknown) => state };

// ─── Cook Auth Store ─────────────────────────────────────────────────────────

interface CookAuthState {
  phone: string | null;
  isLoggedIn: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  cookId: string | null;
  cookName: string | null;
  cookRole: string | null;
  // Actions
  sendOtp: (phone: string) => Promise<void>;
  login: (phone: string, otp: string) => Promise<void>;
  logout: () => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  hydrate: () => void;
}

export const useCookAuthStore = create<CookAuthState>()(
  persist(
    (set, get) => ({
      phone: null,
      isLoggedIn: false,
      accessToken: null,
      refreshToken: null,
      cookId: null,
      cookName: null,
      cookRole: null,

      sendOtp: async (phone: string) => {
        await sendCookOtp(phone);
      },

      login: async (phone: string, otp: string) => {
        const result = await verifyCookOtp(phone, otp);
        set({
          phone,
          isLoggedIn: true,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          cookId: result.user.id,
          cookName: result.user.name || 'Sita Lakshmi',
          cookRole: result.user.role,
        });
        get().hydrate();
      },

      logout: () => {
        set({
          phone: null,
          isLoggedIn: false,
          accessToken: null,
          refreshToken: null,
          cookId: null,
          cookName: null,
          cookRole: null,
        });
      },

      setTokens: (accessToken: string, refreshToken: string) => {
        set({ accessToken, refreshToken });
      },

      hydrate: () => {
        configureApiClient({
          getAccessToken: () => useCookAuthStore.getState().accessToken,
          getRefreshToken: () => useCookAuthStore.getState().refreshToken,
          onTokenRefreshed: (newAccess, newRefresh) => {
            useCookAuthStore.getState().setTokens(newAccess, newRefresh);
          },
          onAuthExpired: () => {
            useCookAuthStore.getState().logout();
          },
        });
      },
    }),
    {
      name: 'cookii-cook-auth',
      ...config,
    },
  ),
);

// ─── Cook Core Store ─────────────────────────────────────────────────────────

interface CookStoreState {
  isOnline: boolean;
  toggleOnline: () => void;
  currentBookingId: string | null;
  todayEarnings: number;
  thisWeekEarnings: number;
  totalEarnings: number;
  rating: number;
  jobsCompleted: number;
  payoutStatus: 'Paid' | 'Processing' | 'Pending';
  profile: CookProfile;
  transactions: EarningsTransaction[];
  scheduleSlots: ScheduleSlot[];
  updateProfile: (partial: Partial<CookProfile>) => void;
  toggleSlotStatus: (slotId: string) => void;
  addEarnings: (amount: number, title: string, bookingRef?: string) => void;
}

export const useCookStore = create<CookStoreState>()(
  persist(
    (set) => ({
      isOnline: true,
      toggleOnline: () => set((s) => ({ isOnline: !s.isOnline })),
      currentBookingId: 'job-act-201',
      todayEarnings: 1150,
      thisWeekEarnings: 7450,
      totalEarnings: 82400,
      rating: 4.9,
      jobsCompleted: 184,
      payoutStatus: 'Paid',
      profile: mockProfile,
      transactions: initialTransactions,
      scheduleSlots: initialScheduleSlots,

      updateProfile: (partial) =>
        set((s) => ({
          profile: { ...s.profile, ...partial },
        })),

      toggleSlotStatus: (slotId: string) =>
        set((s) => ({
          scheduleSlots: s.scheduleSlots.map((slot) => {
            if (slot.id !== slotId) return slot;
            const nextStatus: ScheduleSlot['status'] =
              slot.status === 'available' ? 'blocked' : 'available';
            return { ...slot, status: nextStatus };
          }),
        })),

      addEarnings: (amount: number, title: string, bookingRef?: string) =>
        set((s) => ({
          todayEarnings: s.todayEarnings + amount,
          thisWeekEarnings: s.thisWeekEarnings + amount,
          totalEarnings: s.totalEarnings + amount,
          jobsCompleted: s.jobsCompleted + 1,
          transactions: [
            {
              id: `txn-${Date.now()}`,
              title,
              amount,
              type: 'credit',
              date: 'Just now',
              bookingRef,
              status: 'Completed',
            },
            ...s.transactions,
          ],
        })),
    }),
    {
      name: 'cookii-cook-state',
      ...config,
    },
  ),
);

// ─── Job Store ───────────────────────────────────────────────────────────────

interface JobStoreState {
  pendingOffers: JobOffer[];
  activeJobs: ActiveJob[];
  completedToday: CompletedJob[];
  acceptJob: (id: string) => void;
  declineJob: (id: string) => void;
  advanceActiveJobStatus: (id: string) => void;
  completeActiveJob: (id: string) => void;
}

export const useJobStore = create<JobStoreState>()(
  persist(
    (set, get) => ({
      pendingOffers: initialPendingOffers,
      activeJobs: initialActiveJobs,
      completedToday: initialCompletedJobs,

      acceptJob: (id: string) => {
        const offer = get().pendingOffers.find((o) => o.id === id);
        if (!offer) return;

        const newActiveJob: ActiveJob = {
          id: `job-act-${Date.now()}`,
          customerName: offer.customerName,
          customerPhone: '+91 98765 00000',
          customerArea: offer.customerArea,
          fullAddress: offer.fullAddress || `${offer.customerArea}, Bengaluru`,
          mealType: offer.mealType,
          durationMinutes: offer.durationMinutes,
          earnings: offer.earnings,
          scheduledTime: offer.requestedTime,
          date: offer.date,
          dishes: offer.dishes,
          status: 'accepted',
        };

        set((s) => ({
          pendingOffers: s.pendingOffers.filter((o) => o.id !== id),
          activeJobs: [newActiveJob, ...s.activeJobs],
        }));

        useCookStore.setState({ currentBookingId: newActiveJob.id });
      },

      declineJob: (id: string) => {
        set((s) => ({
          pendingOffers: s.pendingOffers.filter((o) => o.id !== id),
        }));
      },

      advanceActiveJobStatus: (id: string) => {
        set((s) => ({
          activeJobs: s.activeJobs.map((job) => {
            if (job.id !== id) return job;
            if (job.status === 'accepted') return { ...job, status: 'on_the_way' };
            if (job.status === 'on_the_way') return { ...job, status: 'arrived' };
            if (job.status === 'arrived') return { ...job, status: 'cooking' };
            return job;
          }),
        }));
      },

      completeActiveJob: (id: string) => {
        const job = get().activeJobs.find((j) => j.id === id);
        if (!job) return;

        const completed: CompletedJob = {
          id: `comp-${Date.now()}`,
          customerName: job.customerName,
          customerArea: job.customerArea,
          mealType: job.mealType,
          completedAt: 'Just now',
          durationMinutes: job.durationMinutes,
          earnings: job.earnings,
          rating: 5,
        };

        set((s) => ({
          activeJobs: s.activeJobs.filter((j) => j.id !== id),
          completedToday: [completed, ...s.completedToday],
        }));

        useCookStore.getState().addEarnings(
          job.earnings,
          `${job.mealType} Booking - ${job.customerArea}`,
          job.id,
        );
      },
    }),
    {
      name: 'cookii-cook-jobs',
      ...config,
    },
  ),
);
