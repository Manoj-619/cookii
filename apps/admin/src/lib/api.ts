import {
  Booking,
  Cook,
  Customer,
  PaymentTransaction,
  Coupon,
  DashboardMetrics,
  CookVerificationStatusType,
  DocumentStatusType,
} from './types';
import {
  MOCK_BOOKINGS,
  MOCK_COOKS,
  MOCK_CUSTOMERS,
  MOCK_PAYMENTS,
  MOCK_COUPONS,
  MOCK_DASHBOARD_METRICS,
} from './mockData';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Cookie and token retrieval helper
 */
export function getAdminToken(): string | null {
  if (typeof document === 'undefined') {
    return process.env.ADMIN_AUTH_TOKEN || null;
  }
  const match = document.cookie.match(new RegExp('(^| )ZapEat_admin_token=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

export function setAdminToken(token: string, days = 7) {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `ZapEat_admin_token=${encodeURIComponent(token)}; expires=${expires}; path=/; SameSite=Lax`;
}

export function clearAdminToken() {
  if (typeof document === 'undefined') return;
  document.cookie = 'ZapEat_admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax';
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ data: T; error?: string }> {
    const token = getAdminToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string>),
    };

    try {
      const url = `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
      const res = await fetch(url, { ...options, headers });
      
      if (!res.ok) {
        const errorText = await res.text();
        let message = `API Error ${res.status}: ${res.statusText}`;
        try {
          const parsed = JSON.parse(errorText);
          message = parsed.message || parsed.error || message;
        } catch {
          // ignore
        }
        return { data: null as unknown as T, error: message };
      }

      const json = await res.json();
      return { data: json.data !== undefined ? json.data : json };
    } catch (err) {
      const errMessage = err instanceof Error ? err.message : 'Network request failed';
      return { data: null as unknown as T, error: errMessage };
    }
  }

  get<T>(endpoint: string, headers?: Record<string, string>) {
    return this.request<T>(endpoint, { method: 'GET', headers });
  }

  post<T>(endpoint: string, body?: unknown, headers?: Record<string, string>) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      headers,
    });
  }

  patch<T>(endpoint: string, body?: unknown, headers?: Record<string, string>) {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
      headers,
    });
  }

  delete<T>(endpoint: string, headers?: Record<string, string>) {
    return this.request<T>(endpoint, { method: 'DELETE', headers });
  }
}

export const api = new ApiClient(API_BASE_URL);

// In-memory state storage to preserve mutations across tabs/screens in demo/mock mode
let bookingsState: Booking[] = [...MOCK_BOOKINGS];
let cooksState: Cook[] = [...MOCK_COOKS];
let customersState: Customer[] = [...MOCK_CUSTOMERS];
let paymentsState: PaymentTransaction[] = [...MOCK_PAYMENTS];
let couponsState: Coupon[] = [...MOCK_COUPONS];

/**
 * Admin Authentication API
 */
export const adminAuthApi = {
  async login(email: string, pass: string): Promise<{ success: boolean; token: string; user?: any; error?: string }> {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, token: '', error: data.error || 'Invalid credentials' };
      }
      setAdminToken(data.token);
      return data;
    } catch {
      // Offline fallback
      if (email.trim().length > 0 && pass.trim().length > 0) {
        const mockToken = 'ZapEat_admin_jwt_' + Math.random().toString(36).substring(2);
        setAdminToken(mockToken);
        return {
          success: true,
          token: mockToken,
          user: {
            id: 'admin-1',
            name: 'Priya Sharma',
            email,
            role: 'ADMIN',
          },
        };
      }
      return { success: false, token: '', error: 'Please enter valid credentials' };
    }
  },

  async logout(): Promise<void> {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    clearAdminToken();
  },
};

/**
 * Operations & KPI API
 */
export const opsApi = {
  async getMetrics(): Promise<DashboardMetrics> {
    const res = await api.get<DashboardMetrics>('/admin/metrics');
    if (res.data) return res.data;
    return MOCK_DASHBOARD_METRICS;
  },

  async broadcastNotification(title: string, message: string, target: 'COOKS' | 'CUSTOMERS' | 'ALL'): Promise<boolean> {
    const res = await api.post('/admin/notifications/broadcast', { title, message, target });
    return !res.error;
  },
};

/**
 * Bookings API
 */
export const bookingsApi = {
  async getAll(params?: { status?: string; search?: string }): Promise<Booking[]> {
    const res = await api.get<Booking[]>('/admin/bookings');
    let list = res.data || bookingsState;

    if (params?.status && params.status !== 'ALL') {
      list = list.filter((b) => b.status === params.status);
    }
    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(
        (b) =>
          b.id.toLowerCase().includes(q) ||
          b.customerName.toLowerCase().includes(q) ||
          (b.cookName && b.cookName.toLowerCase().includes(q)) ||
          b.locality.toLowerCase().includes(q)
      );
    }
    return list;
  },

  async getById(id: string): Promise<Booking | null> {
    const res = await api.get<Booking>(`/admin/bookings/${id}`);
    if (res.data) return res.data;
    return bookingsState.find((b) => b.id === id) || null;
  },

  async updateStatus(id: string, status: Booking['status']): Promise<Booking | null> {
    const res = await api.patch<Booking>(`/admin/bookings/${id}/status`, { status });
    if (res.data) return res.data;

    bookingsState = bookingsState.map((b) => (b.id === id ? { ...b, status } : b));
    return bookingsState.find((b) => b.id === id) || null;
  },
};

/**
 * Cooks API
 */
export const cooksApi = {
  async getAll(params?: { status?: string; search?: string }): Promise<Cook[]> {
    const res = await api.get<Cook[]>('/admin/cooks');
    let list = res.data || cooksState;

    if (params?.status && params.status !== 'ALL') {
      list = list.filter((c) => c.status === params.status);
    }
    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.zone.toLowerCase().includes(q)
      );
    }
    return list;
  },

  async getById(id: string): Promise<Cook | null> {
    const res = await api.get<Cook>(`/admin/cooks/${id}`);
    if (res.data) return res.data;
    const cook = cooksState.find((c) => c.id === id);
    if (!cook) return null;
    return {
      ...cook,
      recentBookings: bookingsState.filter((b) => b.cookId === id),
    };
  },

  async updateStatus(id: string, status: CookVerificationStatusType): Promise<Cook | null> {
    const res = await api.post<Cook>(`/admin/cooks/${id}/verify`, { status });
    if (res.data) return res.data;

    cooksState = cooksState.map((c) => (c.id === id ? { ...c, status } : c));
    return cooksState.find((c) => c.id === id) || null;
  },

  async verifyDocument(
    cookId: string,
    docId: string,
    status: DocumentStatusType,
    rejectionReason?: string
  ): Promise<boolean> {
    const cook = cooksState.find((c) => c.id === cookId);
    if (!cook) return false;

    cook.documents = cook.documents.map((d) =>
      d.id === docId
        ? {
            ...d,
            status,
            rejectionReason: status === 'REJECTED' ? rejectionReason : undefined,
            verifiedAt: status === 'APPROVED' ? new Date().toISOString() : undefined,
          }
        : d
    );

    // If all docs are approved, promote cook status
    const allApproved = cook.documents.every((d) => d.status === 'APPROVED');
    if (allApproved && cook.documents.length >= 2) {
      cook.status = 'VERIFIED';
    } else if (cook.documents.some((d) => d.status === 'REJECTED')) {
      cook.status = 'REJECTED';
    }

    return true;
  },

  async approveAllKYC(cookId: string): Promise<Cook | null> {
    const cook = cooksState.find((c) => c.id === cookId);
    if (!cook) return null;

    cook.documents = cook.documents.map((d) => ({
      ...d,
      status: 'APPROVED' as DocumentStatusType,
      verifiedAt: new Date().toISOString(),
      rejectionReason: undefined,
    }));
    cook.status = 'VERIFIED';
    return { ...cook };
  },

  async suspendCook(cookId: string): Promise<Cook | null> {
    const cook = cooksState.find((c) => c.id === cookId);
    if (!cook) return null;
    cook.status = 'SUSPENDED';
    cook.isOnline = false;
    cook.isAvailable = false;
    return { ...cook };
  },
};

/**
 * Customers API
 */
export const customersApi = {
  async getAll(params?: { search?: string }): Promise<Customer[]> {
    const res = await api.get<Customer[]>('/admin/customers');
    let list = res.data || customersState;

    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.locality.toLowerCase().includes(q)
      );
    }
    return list;
  },
};

/**
 * Payments API
 */
export const paymentsApi = {
  async getAll(params?: { type?: string; search?: string }): Promise<PaymentTransaction[]> {
    const res = await api.get<PaymentTransaction[]>('/admin/payments');
    let list = res.data || paymentsState;

    if (params?.type && params.type !== 'ALL') {
      list = list.filter((p) => p.type === params.type);
    }
    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.id.toLowerCase().includes(q) ||
          p.razorpayPaymentId.toLowerCase().includes(q) ||
          p.customerName.toLowerCase().includes(q) ||
          (p.bookingId && p.bookingId.toLowerCase().includes(q))
      );
    }
    return list;
  },
};

/**
 * Coupons API
 */
export const couponsApi = {
  async getAll(): Promise<Coupon[]> {
    const res = await api.get<Coupon[]>('/admin/coupons');
    return res.data || couponsState;
  },

  async create(data: Omit<Coupon, 'id' | 'timesUsed' | 'createdAt'>): Promise<Coupon> {
    const newCoupon: Coupon = {
      ...data,
      id: `CPN-${Date.now().toString().slice(-4)}`,
      timesUsed: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    couponsState = [newCoupon, ...couponsState];
    return newCoupon;
  },

  async toggleActive(id: string): Promise<Coupon | null> {
    couponsState = couponsState.map((c) =>
      c.id === id ? { ...c, isActive: !c.isActive } : c
    );
    return couponsState.find((c) => c.id === id) || null;
  },
};
