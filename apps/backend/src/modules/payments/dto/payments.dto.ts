import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, Min } from 'class-validator';

export class CreateRazorpayOrderDto {
  @ApiProperty({ example: 'bk_202611_4819' })
  @IsNotEmpty()
  @IsString()
  bookingId!: string;

  @ApiProperty({ example: 'c0a80124-7f1c-4d3e-908a-364219bfe218' })
  @IsNotEmpty()
  @IsString()
  idempotencyKey!: string;
}

export class WalletTopupDto {
  @ApiProperty({ example: 500, minimum: 100 })
  @IsNotEmpty()
  @IsNumber()
  @Min(100)
  amount!: number;
}

