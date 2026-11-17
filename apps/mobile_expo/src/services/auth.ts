/**
 * Cookii Auth Service
 * ───────────────────
 * Thin typed wrappers over the backend auth API.
 * All calls go through the shared Axios apiClient.
 */

import { apiPost } from './api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  phone?: string;
  email?: string;
  name: string;
  role: string;
  provider: 'phone' | 'google';
  isPhoneVerified?: boolean;
  isEmailVerified?: boolean;
}

export interface AuthTokens {
  tokenType: 'Bearer';
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResult extends AuthTokens {
  user: AuthUser;
}

export interface SendOtpResult {
  message: string;
  phone: string;
  expiresInSeconds: number;
}

// ─── Service Functions ────────────────────────────────────────────────────────

/**
 * Request a 6-digit OTP for the given Indian mobile number.
 * In dev/mock mode the backend accepts any 10-digit number and
 * the OTP is always MOCK_OTP_CODE (default: 123456).
 */
export async function sendOtp(phone: string): Promise<SendOtpResult> {
  return apiPost<SendOtpResult>('/auth/otp/send', { phone });
}

/**
 * Verify the OTP and return access + refresh JWT tokens along with
 * the authenticated user profile.
 */
export async function verifyOtp(phone: string, otp: string): Promise<AuthResult> {
  return apiPost<AuthResult>('/auth/otp/verify', { phone, otp });
}

/**
 * Exchange a refresh token for a new access + refresh token pair.
 * Called automatically by the Axios interceptor on 401 responses.
 */
export async function refreshToken(token: string): Promise<AuthTokens> {
  return apiPost<AuthTokens>('/auth/token/refresh', { refreshToken: token });
}
