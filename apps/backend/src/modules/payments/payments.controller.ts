import { Controller, Post, Get, Body, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreateRazorpayOrderDto, VerifyPaymentDto, WalletTopupDto } from './dto/payments.dto';

@ApiTags('Payments & Wallet')
@Controller()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('payments/razorpay/create-order')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Razorpay payment order for booking' })
  async createOrder(@Headers('user-id') userId: string, @Body() dto: CreateRazorpayOrderDto) {
    return this.paymentsService.createRazorpayOrder(userId, dto);
  }

  @Post('payments/razorpay/verify')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify Razorpay payment signature' })
  async verifyPayment(@Headers('user-id') userId: string, @Body() dto: VerifyPaymentDto) {
    return this.paymentsService.verifyPayment(userId, dto);
  }

  @Post('payments/razorpay/webhook')
  @ApiOperation({ summary: 'Razorpay webhook endpoint' })
  async webhook(@Headers() headers: Record<string, string>, @Body() payload: any) {
    return this.paymentsService.processWebhook(headers, payload);
  }

  @Get('wallet/balance')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user wallet balance' })
  async getWalletBalance(@Headers('user-id') userId: string) {
    return this.paymentsService.getWalletBalance(userId);
  }

  @Get('wallet/transactions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get double-entry wallet ledger statement' })
  async getWalletTransactions(@Headers('user-id') userId: string) {
    return this.paymentsService.getWalletTransactions(userId);
  }

  @Post('wallet/topup')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Top up wallet via Razorpay' })
  async topupWallet(@Headers('user-id') userId: string, @Body() dto: WalletTopupDto) {
    return this.paymentsService.topupWallet(userId, dto);
  }
}

