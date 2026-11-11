import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsEmail, IsBoolean, IsNumber } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ example: 'Arjun Rao', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'arjun@example.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;
}

export class CreateAddressDto {
  @ApiProperty({ example: 'Home' })
  @IsNotEmpty()
  @IsString()
  label!: string;

  @ApiProperty({ example: 'Flat 402, Green Glen Layout, Bellandur, Bengaluru' })
  @IsNotEmpty()
  @IsString()
  fullAddress!: string;

  @ApiProperty({ example: 'Near Central Mall', required: false })
  @IsOptional()
  @IsString()
  landmark?: string;

  @ApiProperty({ example: '560103' })
  @IsNotEmpty()
  @IsString()
  pincode!: string;

  @ApiProperty({ example: 77.6744, description: 'Longitude' })
  @IsNotEmpty()
  @IsNumber()
  longitude!: number;

  @ApiProperty({ example: 12.9299, description: 'Latitude' })
  @IsNotEmpty()
  @IsNumber()
  latitude!: number;

  @ApiProperty({ example: true, default: false, required: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

