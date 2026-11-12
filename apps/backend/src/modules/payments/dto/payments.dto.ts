import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateRazorpayOrderDto {
  @ApiProperty({ example: 'BK-89012' })
  @IsNotEmpty()
  @IsString()
  bookingId!: string;

  @ApiProperty({ example: 248, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  amount?: number;

  @ApiProperty({ example: 'c0a80124-7f1c-4d3e-908a-364219bfe218', required: false })
  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}

export class VerifyPaymentDto {
  @ApiProperty({ example: 'order_EKwxwAgItmmXdp' })
  @IsNotEmpty()
  @IsString()
  razorpayOrderId!: string;

  @ApiProperty({ example: 'pay_29MoMHvdLWeIqa' })
  @IsNotEmpty()
  @IsString()
  razorpayPaymentId!: string;

  @ApiProperty({ example: '9ef4b6fa45da56b08366a3b5eee582dd9e030d0f13f9f3b660f608243b8087e8' })
  @IsNotEmpty()
  @IsString()
  razorpaySignature!: string;

  @ApiProperty({ example: 'BK-89012' })
  @IsNotEmpty()
  @IsString()
  bookingId!: string;
}

export class WalletTopupDto {
  @ApiProperty({ example: 500, minimum: 100 })
  @IsNotEmpty()
  @IsNumber()
  @Min(100)
  amount!: number;
}
