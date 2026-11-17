import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  UseGuards,
  RawBodyRequest,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreateRazorpayOrderDto, VerifyPaymentDto, WalletTopupDto } from './dto/payments.dto';
import { JwtAuthGuard, CurrentUser, JwtPayload } from '../../common/guards/jwt-auth.guard';

@ApiTags('Payments & Wallet')
@Controller()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // ─── Razorpay Order Creation ───────────────────────────────────────────────

  @Post('payments/razorpay/create-order')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('BearerAuth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create Razorpay payment order for booking' })
  @ApiResponse({ status: 200, description: 'Razorpay order created with orderId and keyId' })
  @ApiResponse({ status: 401, description: 'Unauthorized – missing or invalid JWT' })
  async createOrder(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateRazorpayOrderDto,
  ) {
    return this.paymentsService.createRazorpayOrder(userId, dto);
  }

  // ─── Razorpay Signature Verification ─────────────────────────────────────

  @Post('payments/razorpay/verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('BearerAuth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify Razorpay payment HMAC signature — called after checkout succeeds' })
  @ApiResponse({ status: 200, description: 'Payment cryptographically verified, booking can be confirmed' })
  @ApiResponse({ status: 400, description: 'Signature mismatch — payment tampered' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async verifyPayment(
    @CurrentUser('sub') userId: string,
    @Body() dto: VerifyPaymentDto,
  ) {
    return this.paymentsService.verifyPayment(userId, dto);
  }

  // ─── Razorpay Webhook ─────────────────────────────────────────────────────

  @Post('payments/razorpay/webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Razorpay webhook endpoint (HMAC-SHA256 verified)' })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  async webhook(
    @Headers() headers: Record<string, string>,
    @Body() payload: any,
  ) {
    return this.paymentsService.processWebhook(headers, payload);
  }

  // ─── Wallet ───────────────────────────────────────────────────────────────

  @Get('wallet/balance')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('BearerAuth')
  @ApiOperation({ summary: 'Get current user wallet balance' })
  async getWalletBalance(@CurrentUser('sub') userId: string) {
    return this.paymentsService.getWalletBalance(userId);
  }

  @Get('wallet/transactions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('BearerAuth')
  @ApiOperation({ summary: 'Get double-entry wallet ledger statement' })
  async getWalletTransactions(@CurrentUser('sub') userId: string) {
    return this.paymentsService.getWalletTransactions(userId);
  }

  @Post('wallet/topup')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('BearerAuth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create Razorpay order to top up wallet' })
  async topupWallet(
    @CurrentUser('sub') userId: string,
    @Body() dto: WalletTopupDto,
  ) {
    return this.paymentsService.topupWallet(userId, dto);
  }
}
