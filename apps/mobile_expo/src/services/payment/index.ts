/**
 * Payment Service Entry Point
 * ───────────────────────────
 * Exports a configured paymentService instance.
 *
 * In production: uses RazorpayPaymentProvider (real Razorpay API + backend verification)
 * In dev with placeholder keys: RazorpayPaymentProvider auto-detects and runs in sandbox mode
 *
 * The UI (confirm.tsx, wallet.tsx) calls processPayment() — it doesn't need
 * to know which provider is active.
 */

import { RazorpayPaymentProvider, PaymentProvider } from './PaymentProvider';
import { PaymentRequest, PaymentResult } from './types';

// ─── Provider instance ────────────────────────────────────────────────────────
// Customer name/phone are injected at checkout time via the request object.
// We supply fallbacks here; the provider will prefer request.customer values.
export const paymentService: PaymentProvider = new RazorpayPaymentProvider({
  customerName: 'Cookii Customer',
  customerPhone: '9999999999',
});

// ─── High-level payment orchestrator ─────────────────────────────────────────

/**
 * processPayment
 *
 * Handles wallet-first payment logic:
 *  1. If method is 'wallet' and wallet has sufficient balance → debit locally
 *  2. If remaining amount > 0 → route to Razorpay provider
 *
 * Returns the payment result + how much wallet was used (for the caller to debit).
 */
export async function processPayment(
  request: PaymentRequest,
  method: PaymentResult['method'],
  walletBalance: number,
  provider: PaymentProvider = paymentService,
): Promise<{ result: PaymentResult; walletUsed: number }> {
  const walletUsed =
    method === 'wallet' ? Math.min(walletBalance, request.amount) : 0;

  const remaining = request.amount - walletUsed;

  // Wallet fully covers the booking
  if (remaining <= 0) {
    return {
      result: {
        status: 'success',
        referenceId: `WALLET-${Date.now()}`,
        method: 'wallet',
      },
      walletUsed,
    };
  }

  // Pay remaining amount via Razorpay (or mock in dev)
  const result = await provider.createOrder(
    { ...request, amount: remaining },
    method === 'wallet' ? 'upi' : method,
  );

  return {
    result,
    walletUsed: result.status === 'success' ? walletUsed : 0,
  };
}

export type { PaymentRequest, PaymentResult };
