import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEnum, IsNumber, Min, Max, IsOptional, IsString } from 'class-validator';
import { ServiceType } from '@cookii/shared-types';

export class CalculateFareDto {
  @ApiProperty({ enum: ServiceType, example: ServiceType.LUNCH })
  @IsNotEmpty()
  @IsEnum(ServiceType)
  serviceType!: ServiceType;

  @ApiProperty({ example: 2, minimum: 1, maximum: 10 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(10)
  personCount!: number;

  @ApiProperty({ example: 77.6245 })
  @IsNotEmpty()
  @IsNumber()
  longitude!: number;

  @ApiProperty({ example: 12.9352 })
  @IsNotEmpty()
  @IsNumber()
  latitude!: number;

  @ApiProperty({ example: 'NAMMACOOKII', required: false })
  @IsOptional()
  @IsString()
  couponCode?: string;
}

export class ValidateCouponDto {
  @ApiProperty({ example: 'NAMMACOOKII' })
  @IsNotEmpty()
  @IsString()
  code!: string;

  @ApiProperty({ example: 450 })
  @IsNotEmpty()
  @IsNumber()
  orderValue!: number;
}

