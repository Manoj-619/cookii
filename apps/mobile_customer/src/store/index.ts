import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, addDays } from 'date-fns';
import { Address, Booking, BookingDraft, WalletTxn } from '../types';
import { addresses } from '../data/addresses';
import { seededBookings } from '../data/bookings';
import { initialCash, initialBonus, transactions } from '../data/wallet';
import { cooks } from '../data/cooks';
import { generateBookingId } from '../lib/ids';
import { sendOtp, verifyOtp, AuthUser } from '../services/auth';
import { configureApiClient } from '../services/api';

const storage = createJSONStorage(() => AsyncStorage);
const config = { version: 1, storage, migrate: (state: unknown) => state };

// ─── Auth Store ───────────────────────────────────────────────────────────────

interface AuthState {
  phone: string | null;
  isLoggedIn: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  userId: string | null;
  userName: string | null;
  userRole: string | null;
  // Actions
  sendOtp: (phone: string) => Promise<void>;
  login: (phone: string, otp: string) => Promise<void>;
  logout: () => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      phone: null,
      isLoggedIn: false,
      accessToken: null,
      refreshToken: null,
      userId: null,
      userName: null,
      userRole: null,

      sendOtp: async (phone: string) => {
        await sendOtp(phone);
      },

      login: async (phone: string, otp: string) => {
        const result = await verifyOtp(phone, otp);
        set({
          phone,
          isLoggedIn: true,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          userId: result.user.id,
          userName: result.user.name,
          userRole: result.user.role,
        });
        // Update the global API client with the new tokens
        get().hydrate();
      },

      logout: () => {
        set({
          phone: null,
          isLoggedIn: false,
          accessToken: null,
          refreshToken: null,
          userId: null,
          userName: null,
          userRole: null,
        });
      },

      setTokens: (accessToken: string, refreshToken: string) => {
        set({ accessToken, refreshToken });
      },

      /**
       * Wire the persisted token store to the global Axios API client.
       * Must be called once on app start and again after any token change.
       */
      hydrate: () => {
        const state = get();
        configureApiClient({
          getAccessToken: () => useAuthStore.getState().accessToken,
          getRefreshToken: () => useAuthStore.getState().refreshToken,
          onTokenRefreshed: (newAccess, newRefresh) => {
            useAuthStore.getState().setTokens(newAccess, newRefresh);
          },
          onAuthExpired: () => {
            useAuthStore.getState().logout();
          },
        });
      },
    }),
    {
      name: 'ZapEat-auth',
      ...config,
    },
  ),
);

// ─── User Store ────────────────────────────────────────────────────────────────

export const useUserStore = create<{
  name: string;
  avatarInitials: string;
  favoriteCookIds: string[];
  addresses: Address[];
  setName: (name: string) => void;
  toggleFavorite: (id: string) => void;
  selectAddress: (id: string) => void;
  addAddress: (a: Address) => void;
  removeAddress: (id: string) => void;
}>()(
  persist(
    (set) => ({
      name: 'ZapEat Guest',
      avatarInitials: 'CG',
      favoriteCookIds: ['cook-1', 'cook-2'],
      addresses,
      setName: (name) =>
        set({
          name,
          avatarInitials: name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((s) => s[0]?.toUpperCase() || '')
            .join(''),
        }),
      toggleFavorite: (id) =>
        set((s) => ({
          favoriteCookIds: s.favoriteCookIds.includes(id)
            ? s.favoriteCookIds.filter((x) => x !== id)
            : [...s.favoriteCookIds, id],
        })),
      selectAddress: (id) =>
        set((s) => ({
          addresses: s.addresses.map((a) => ({ ...a, isSelected: a.id === id })),
        })),
      addAddress: (a) => set((s) => ({ addresses: [...s.addresses, a] })),
      removeAddress: (id) =>
        set((s) => ({ addresses: s.addresses.filter((a) => a.id !== id) })),
    }),
    { name: 'ZapEat-user', ...config },
  ),
);

// ─── Booking Store ─────────────────────────────────────────────────────────────

export const defaultDraft = (): BookingDraft => ({
  mode: 'scheduled',
  date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
  startTime: '',
  durationMinutes: 60,
  cookId: null,
  mealTypes: ['lunch'],
  addressId: 'home',
});

export const useBookingStore = create<{
  bookings: Booking[];
  draft: BookingDraft;
  setDraft: (p: Partial<BookingDraft>) => void;
  resetDraft: () => void;
  confirmBooking: (payment: {
    amountPaid: number;
    savings: number;
    paymentRef: string;
  }) => Booking;
  cancelBooking: (id: string) => void;
  rescheduleBooking: (id: string, date: string, startTime: string) => void;
  markCompleted: (id: string) => void;
}>()(
  persist(
    (set, get) => ({
      bookings: seededBookings,
      draft: defaultDraft(),
      setDraft: (p) => set((s) => ({ draft: { ...s.draft, ...p } })),
      resetDraft: () => set({ draft: defaultDraft() }),
      confirmBooking: (payment) => {
        const d = get().draft;
        const cook = cooks.find((c) => c.id === d.cookId);
        const address =
          useUserStore.getState().addresses.find((a) => a.id === d.addressId) ||
          useUserStore.getState().addresses[0];
        if (!address) throw new Error('Select an address');

        const booking: Booking = {
          ...d,
          id: generateBookingId(),
          cookName: cook?.name || 'Best Available',
          address,
          amountPaid: payment.amountPaid,
          savings: payment.savings,
          paymentRef: payment.paymentRef,
          status: 'upcoming',
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ bookings: [booking, ...s.bookings], draft: defaultDraft() }));
        return booking;
      },
      cancelBooking: (id) =>
        set((s) => ({
          bookings: s.bookings.map((b) =>
            b.id === id ? { ...b, status: 'cancelled' } : b,
          ),
        })),
      rescheduleBooking: (id, date, startTime) =>
        set((s) => ({
          bookings: s.bookings.map((b) =>
            b.id === id ? { ...b, date, startTime } : b,
          ),
        })),
      markCompleted: (id) =>
        set((s) => ({
          bookings: s.bookings.map((b) =>
            b.id === id ? { ...b, status: 'completed' } : b,
          ),
        })),
    }),
    { name: 'ZapEat-bookings', ...config },
  ),
);

// ─── Wallet Store ──────────────────────────────────────────────────────────────

export const useWalletStore = create<{
  cashBalance: number;
  bonusBalance: number;
  transactions: WalletTxn[];
  addMoney: (amount: number) => void;
  debit: (amount: number, title: string) => boolean;
}>()(
  persist(
    (set, get) => ({
      cashBalance: initialCash,
      bonusBalance: initialBonus,
      transactions,
      addMoney: (amount) =>
        set((s) => ({
          cashBalance: s.cashBalance + amount,
          transactions: [
            {
              id: `txn-${Date.now()}`,
              title: 'Added money',
              amount,
              status: 'Received',
              createdAt: new Date().toISOString(),
            },
            ...s.transactions,
          ],
        })),
      debit: (amount, title) => {
        if (get().cashBalance < amount) return false;
        set((s) => ({
          cashBalance: s.cashBalance - amount,
          transactions: [
            {
              id: `txn-${Date.now()}`,
              title,
              amount: -amount,
              status: 'Completed',
              createdAt: new Date().toISOString(),
            },
            ...s.transactions,
          ],
        }));
        return true;
      },
    }),
    { name: 'ZapEat-wallet', ...config },
  ),
);
