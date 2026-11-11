import { Injectable, Logger } from '@nestjs/common';
import { CreateRazorpayOrderDto, WalletTopupDto } from './dto/payments.dto';
import { LedgerAccount, LedgerEntryType } from '@cookii/shared-types';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  async createRazorpayOrder(userId: string, dto: CreateRazorpayOrderDto) {
    this.logger.log(`Created Razorpay order for booking ${dto.bookingId} (idempotency: ${dto.idempotencyKey})`);
    return {
      success: true,
      data: {
        orderId: `order_rzp_${Date.now()}`,
        amount: 29020, // in paise = ₹290.20
        currency: 'INR',
        keyId: 'rzp_test_placeholder_key',
        bookingId: dto.bookingId,
      },
    };
  }

  async processWebhook(headers: Record<string, string>, payload: any) {
    this.logger.log(`Received Razorpay webhook event: ${payload?.event}`);
    return { success: true, received: true };
  }

  async getWalletBalance(userId: string) {
    return {
      success: true,
      data: {
        userId,
        balance: 450.0,
        currency: 'INR',
        updatedAt: new Date().toISOString(),
      },
    };
  }

  async getWalletTransactions(userId: string) {
    return {
      success: true,
      data: [
        {
          id: 'tx_101',
          account: LedgerAccount.CUSTOMER_WALLET,
          type: LedgerEntryType.CREDIT,
          amount: 500.0,
          balanceAfter: 500.0,
          description: 'UPI Topup via GPay',
          createdAt: '2026-11-10T10:00:00.000Z',
        },
        {
          id: 'tx_102',
          account: LedgerAccount.CUSTOMER_WALLET,
          type: LedgerEntryType.DEBIT,
          amount: 50.0,
          balanceAfter: 450.0,
          description: 'Partial payment for booking CK-202611-1022',
          createdAt: '2026-11-10T12:00:00.000Z',
        },
      ],
    };
  }

  async topupWallet(userId: string, dto: WalletTopupDto) {
    return {
      success: true,
      data: {
        orderId: `order_topup_${Date.now()}`,
        amount: dto.amount * 100,
        currency: 'INR',
        keyId: 'rzp_test_placeholder_key',
      },
    };
  }
}

