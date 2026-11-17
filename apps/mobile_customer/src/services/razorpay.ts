/**
 * ZapEat Razorpay Service
 * ───────────────────────
 * Production Razorpay integration that works in both Expo Go (web checkout)
 * and native builds.
 *
 * Flow:
 *  1. App calls `createRazorpayOrder()` → backend creates Razorpay order
 *  2. App calls `openCheckout()` → opens Razorpay Web Checkout via WebBrowser
 *  3. On success, app calls `verifyRazorpayPayment()` → backend verifies HMAC signature
 *  4. If verified → booking is confirmed
 */

import * as WebBrowser from 'expo-web-browser';
import { apiPost } from './api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RazorpayOrderData {
  orderId: string;
  amount: number;      // in paise
  currency: string;
  keyId: string;
  bookingId: string;
}

export interface RazorpayCheckoutOptions {
  orderData: RazorpayOrderData;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  description?: string;
}

export type CheckoutResult =
  | { status: 'success'; paymentId: string; orderId: string; signature: string }
  | { status: 'cancelled' }
  | { status: 'failed'; error: string };

export interface PaymentVerifyResult {
  verified: boolean;
  bookingId: string;
  paymentId: string;
  orderId: string;
  status: string;
  message: string;
}

// ─── Razorpay Order Creation ───────────────────────────────────────────────────

/**
 * Ask the backend to create a Razorpay order.
 * Returns the orderId and keyId needed to open the checkout.
 */
export async function createRazorpayOrder(
  amountINR: number,
  bookingId: string,
): Promise<RazorpayOrderData> {
  return apiPost<RazorpayOrderData>('/payments/razorpay/create-order', {
    amount: amountINR,
    bookingId,
    currency: 'INR',
  });
}

export async function createWalletTopupOrder(amountINR: number): Promise<RazorpayOrderData> {
  return apiPost<RazorpayOrderData>('/wallet/topup', { amount: amountINR });
}

// ─── Razorpay Web Checkout ────────────────────────────────────────────────────

/**
 * Open the Razorpay Standard Checkout in an in-app browser tab.
 *
 * We use the hosted checkout page approach which works in Expo Go without
 * any native module. For a production native build you can swap this for
 * the `react-native-razorpay` SDK by installing it and using its `open()`.
 *
 * The hosted page URL encodes all checkout params as query string values.
 * On payment completion Razorpay redirects to the callback_url we pass,
 * and we parse the result from that URL.
 */
export async function openRazorpayCheckout(
  opts: RazorpayCheckoutOptions,
): Promise<CheckoutResult> {
  const { orderData, customerName, customerPhone, customerEmail, description } = opts;

  // Build the Razorpay hosted checkout URL
  // The hosted checkout page lives at checkout.razorpay.com and accepts
  // all standard checkout options as query parameters.
  const params = new URLSearchParams({
    key_id: orderData.keyId,
    order_id: orderData.orderId,
    amount: String(orderData.amount),
    currency: orderData.currency,
    name: 'Zapeat',
    description: description || 'Home Cook Booking',
    prefill_name: customerName,
    prefill_contact: customerPhone,
    ...(customerEmail ? { prefill_email: customerEmail } : {}),
    // The callback URL uses a custom scheme that expo-web-browser can intercept.
    // Deep link scheme defined in app.json: zapeat://payment
    callback_url: 'zapeat://payment/callback',
    cancel_url: 'zapeat://payment/cancel',
    theme_color: '#3FA366',
  });

  // For test/placeholder keys we simulate a successful payment without
  // opening a real browser (the placeholder key would show an error page).
  if (orderData.keyId.includes('placeholder') || orderData.orderId.startsWith('order_rzp_')) {
    // Sandbox simulation: wait 1.5 seconds to mimic checkout UX
    await new Promise<void>((r) => setTimeout(r, 1500));
    return {
      status: 'success',
      paymentId: `pay_mock_${Date.now()}`,
      orderId: orderData.orderId,
      signature: `mock_sig_${Date.now()}`,
    };
  }

  try {
    const checkoutUrl = `https://api.razorpay.com/v1/checkout/embedded?${params.toString()}`;

    const result = await WebBrowser.openAuthSessionAsync(
      checkoutUrl,
      'zapeat://payment', // Redirect scheme
    );

    if (result.type === 'cancel') {
      return { status: 'cancelled' };
    }

    if (result.type === 'success' && result.url) {
      const url = new URL(result.url);

      // Cancel redirect
      if (result.url.includes('/cancel')) {
        return { status: 'cancelled' };
      }

      // Success redirect — parse payment details from URL params
      const razorpayPaymentId = url.searchParams.get('razorpay_payment_id');
      const razorpayOrderId = url.searchParams.get('razorpay_order_id');
      const razorpaySignature = url.searchParams.get('razorpay_signature');

      if (razorpayPaymentId && razorpayOrderId && razorpaySignature) {
        return {
          status: 'success',
          paymentId: razorpayPaymentId,
          orderId: razorpayOrderId,
          signature: razorpaySignature,
        };
      }
    }

    return { status: 'failed', error: 'Unexpected checkout response' };
  } catch (err: any) {
    return { status: 'failed', error: err?.message || 'Checkout failed' };
  }
}

// ─── Payment Verification ─────────────────────────────────────────────────────

/**
 * Ask the backend to verify the Razorpay HMAC signature.
 * This is the critical security step — the backend recomputes the signature
 * and rejects tampered payments.
 */
export async function verifyRazorpayPayment(params: {
  razorpayPaymentId: string;
  razorpayOrderId: string;
  razorpaySignature: string;
  bookingId: string;
}): Promise<PaymentVerifyResult> {
  return apiPost<PaymentVerifyResult>('/payments/razorpay/verify', params);
}
