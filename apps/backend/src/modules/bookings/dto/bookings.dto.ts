import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEnum, IsNumber, Min, Max, IsArray, IsString, IsOptional, IsDateString } from 'class-validator';
import { ServiceType, PaymentMethod } from '@cookii/shared-types';

export class CreateBookingDto {
  @ApiProperty({ example: 'addr_koramangala' })
  @IsNotEmpty()
  @IsString()
  addressId!: string;

  @ApiProperty({ enum: ServiceType, example: ServiceType.LUNCH })
  @IsNotEmpty()
  @IsEnum(ServiceType)
  serviceType!: ServiceType;

  @ApiProperty({ example: ['SOUTH_INDIAN'], isArray: true })
  @IsNotEmpty()
  @IsArray()
  cuisinesSelected!: string[];

  @ApiProperty({ example: 2, minimum: 1, maximum: 10 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(10)
  personCount!: number;

  @ApiProperty({ example: 'Medium spice, please make soft phulkas', required: false })
  @IsOptional()
  @IsString()
  dietaryNotes?: string;

  @ApiProperty({ example: '2026-11-12T13:00:00.000Z' })
  @IsNotEmpty()
  @IsDateString()
  scheduledStartTime!: string;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.UPI })
  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @ApiProperty({ example: 'NAMMACOOKII', required: false })
  @IsOptional()
  @IsString()
  couponCode?: string;
}

export class CancelBookingDto {
  @ApiProperty({ example: 'Emergency at work, need to reschedule' })
  @IsNotEmpty()
  @IsString()
  reason!: string;
}

export class VerifyStartOtpDto {
  @ApiProperty({ example: '4921', description: '4-digit customer doorstep OTP' })
  @IsNotEmpty()
  @IsString()
  otp!: string;
}

