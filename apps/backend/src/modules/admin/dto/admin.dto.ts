import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsString,
  IsEmail,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AdminLoginDto {
  @ApiProperty({ example: 'ops@cookii.in', description: 'Admin or Operations email' })
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'CookiiAdmin@2026!', description: 'Admin account password' })
  @IsNotEmpty()
  @IsString()
  password!: string;
}

export class RejectCookDto {
  @ApiProperty({
    example: 'Aadhaar copy is unclear. Please upload a clear photo of front & back.',
    description: 'Detailed rejection explanation to be notified to the cook',
  })
  @IsNotEmpty()
  @IsString()
  reason!: string;
}

export class VerifyCookDto {
  @ApiProperty({ enum: ['APPROVED', 'REJECTED'], example: 'APPROVED' })
  @IsNotEmpty()
  @IsEnum(['APPROVED', 'REJECTED'])
  decision!: 'APPROVED' | 'REJECTED';

  @ApiProperty({ example: 'All KYC docs verified and police certificate approved', required: false })
  @IsOptional()
  @IsString()
  remarks?: string;
}

export class PaginationQueryDto {
  @ApiProperty({ example: 1, required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiProperty({ example: 20, required: false, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiProperty({ required: false, description: 'Optional status filter' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ required: false, description: 'Optional verification status filter' })
  @IsOptional()
  @IsString()
  verificationStatus?: string;
}
