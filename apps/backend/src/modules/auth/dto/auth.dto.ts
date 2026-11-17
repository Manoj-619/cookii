import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  Length,
  IsEnum,
  IsOptional,
  IsEmail,
  Matches,
} from 'class-validator';
import { UserRole } from '@zapeat/shared-types';

/**
 * Phone must be provided in one of two formats:
 *  - E.164 international: +919876543210
 *  - Bare 10-digit Indian mobile: 9876543210
 * We normalise to the bare form in the service layer.
 */
const INDIAN_PHONE_REGEX = /^(\+91)?[6-9]\d{9}$/;

export class SendOtpDto {
  @ApiProperty({
    example: '9876543210',
    description: 'Indian mobile number — 10 digits (6–9 start) or +91 prefix',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(INDIAN_PHONE_REGEX, {
    message: 'phone must be a valid Indian 10-digit mobile number',
  })
  phone!: string;
}

export class VerifyOtpDto {
  @ApiProperty({ example: '9876543210' })
  @IsNotEmpty()
  @IsString()
  @Matches(INDIAN_PHONE_REGEX, {
    message: 'phone must be a valid Indian 10-digit mobile number',
  })
  phone!: string;

  @ApiProperty({ example: '123456', description: '6-digit one-time passcode' })
  @IsNotEmpty()
  @Length(6, 6, { message: 'otp must be exactly 6 digits' })
  otp!: string;

  @ApiProperty({ enum: UserRole, default: UserRole.CUSTOMER, required: false })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}

export class GoogleAuthDto {
  @ApiProperty({
    example: 'google_id_token_xyz',
    description: 'Google ID token from mobile or web OAuth client',
  })
  @IsNotEmpty()
  @IsString()
  idToken!: string;

  @ApiProperty({ example: 'arjun.rao@gmail.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'Arjun Rao', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'https://lh3.googleusercontent.com/a/...', required: false })
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @ApiProperty({ enum: UserRole, default: UserRole.CUSTOMER, required: false })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}

export class RefreshTokenDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsIn...' })
  @IsNotEmpty()
  @IsString()
  refreshToken!: string;
}

export class SendEmailOtpDto {
  @ApiProperty({ example: 'arjun.rao@gmail.com', description: 'User email address for verification' })
  @IsNotEmpty()
  @IsEmail()
  email!: string;
}

export class VerifyEmailOtpDto {
  @ApiProperty({ example: 'arjun.rao@gmail.com' })
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '123456', description: '6-digit OTP passcode' })
  @IsNotEmpty()
  @Length(6, 6, { message: 'otp must be exactly 6 digits' })
  otp!: string;

  @ApiProperty({ enum: UserRole, default: UserRole.CUSTOMER, required: false })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}

