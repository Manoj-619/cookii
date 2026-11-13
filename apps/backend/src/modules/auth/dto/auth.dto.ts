import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsPhoneNumber, IsString, Length, IsEnum, IsOptional, IsEmail } from 'class-validator';
import { UserRole } from '@cookii/shared-types';

export class SendOtpDto {
  @ApiProperty({ example: '+919876543210', description: 'Phone number in E.164 format (+91 for India)' })
  @IsNotEmpty()
  @IsString()
  phone!: string;
}

export class VerifyOtpDto {
  @ApiProperty({ example: '+919876543210' })
  @IsNotEmpty()
  @IsString()
  phone!: string;

  @ApiProperty({ example: '123456', description: '6-digit OTP' })
  @IsNotEmpty()
  @Length(6, 6)
  otp!: string;

  @ApiProperty({ enum: UserRole, default: UserRole.CUSTOMER, required: false })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}

export class GoogleAuthDto {
  @ApiProperty({ example: 'google_id_token_xyz', description: 'Google ID token from mobile or web client' })
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

