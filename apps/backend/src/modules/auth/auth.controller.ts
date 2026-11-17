import { Controller, Post, Get, Body, Query, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  SendOtpDto,
  VerifyOtpDto,
  RefreshTokenDto,
  GoogleAuthDto,
  SendEmailOtpDto,
  VerifyEmailOtpDto,
} from './dto/auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('otp/send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send OTP for phone authentication' })
  @ApiResponse({ status: 200, description: 'OTP dispatched successfully' })
  async sendOtp(@Body() dto: SendOtpDto) {
    return this.authService.sendOtp(dto);
  }

  @Post('otp/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP and issue JWT access and refresh tokens' })
  @ApiResponse({ status: 200, description: 'Authenticated successfully' })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }

  @Post('email/send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send OTP verification code to email' })
  @ApiResponse({ status: 200, description: 'Email verification code dispatched' })
  async sendEmailVerification(@Body() dto: SendEmailOtpDto) {
    return this.authService.sendEmailVerification(dto.email);
  }

  @Post('email/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email OTP and issue JWT tokens' })
  @ApiResponse({ status: 200, description: 'Email verified and logged in' })
  async verifyEmailOtp(@Body() dto: VerifyEmailOtpDto) {
    return this.authService.verifyEmailOtp(dto.email, dto.otp, dto.role);
  }

  @Post('google')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in with Google OAuth / ID token' })
  @ApiResponse({ status: 200, description: 'Authenticated successfully with Google' })
  async googleAuth(@Body() dto: GoogleAuthDto) {
    return this.authService.googleAuth(dto);
  }

  @Get('google/callback')
  @ApiOperation({ summary: 'Google OAuth web callback redirect' })
  async googleCallback(@Query('code') code: string, @Res() res: any) {
    return res.redirect('http://localhost:3000/dashboard?auth=google_success');
  }

  @Post('token/refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate refresh token' })
  @ApiResponse({ status: 200, description: 'Token refreshed' })
  async refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto);
  }
}
