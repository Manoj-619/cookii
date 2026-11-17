/**
 * Cookii Cook Auth Service
 * ────────────────────────
 * Wrappers over backend auth API specifically for cook partners (role: 'COOK').
 */

import { apiPost } from './api';

export interface AuthCookUser {
  id: string;
  phone?: string;
  email?: string;
  name: string;
  role: 'COOK' | 'CUSTOMER' | 'ADMIN';
  provider: 'phone' | 'google';
  isPhoneVerified?: boolean;
}

export interface AuthTokens {
  tokenType: 'Bearer';
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthCookResult extends AuthTokens {
  user: AuthCookUser;
}

export interface SendOtpResult {
  message: string;
  phone: string;
  expiresInSeconds: number;
}

/**
 * Request a 6-digit OTP for the given cook's mobile number.
 */
export async function sendCookOtp(phone: string): Promise<SendOtpResult> {
  return apiPost<SendOtpResult>('/auth/otp/send', { phone });
}

/**
 * Verify OTP with role set explicitly to 'COOK'.
 */
export async function verifyCookOtp(phone: string, otp: string): Promise<AuthCookResult> {
  return apiPost<AuthCookResult>('/auth/otp/verify', {
    phone,
    otp,
    role: 'COOK',
  });
}

/**
 * Refresh expired JWT tokens.
 */
export async function refreshCookToken(refreshToken: string): Promise<AuthTokens> {
  return apiPost<AuthTokens>('/auth/token/refresh', { refreshToken });
}
