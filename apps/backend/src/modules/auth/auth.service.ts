import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SendOtpDto, VerifyOtpDto, RefreshTokenDto } from './dto/auth.dto';
import { UserRole } from '@cookii/shared-types';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly configService: ConfigService) {}

  async sendOtp(dto: SendOtpDto) {
    const provider = this.configService.get<string>('OTP_PROVIDER', 'mock');
    this.logger.log(`Dispatching OTP to ${dto.phone} via [${provider}]`);

    // In mock mode or dev, predictable OTP is returned
    return {
      success: true,
      data: {
        message: 'OTP sent successfully',
        phone: dto.phone,
        expiresInSeconds: 300,
      },
    };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const mockOtp = this.configService.get<string>('MOCK_OTP_CODE', '123456');
    if (dto.otp !== mockOtp && dto.otp !== '123456') {
      throw new UnauthorizedException('Invalid or expired OTP code');
    }

    const role = dto.role || UserRole.CUSTOMER;

    return {
      success: true,
      data: {
        accessToken: `mock_jwt_access_token_${Date.now()}`,
        refreshToken: `mock_jwt_refresh_token_${Date.now()}`,
        user: {
          id: 'user_mock_101',
          phone: dto.phone,
          name: role === UserRole.COOK ? 'Sita Lakshmi' : 'Arjun Rao',
          role,
          isPhoneVerified: true,
        },
      },
    };
  }

  async refreshToken(dto: RefreshTokenDto) {
    if (!dto.refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }
    return {
      success: true,
      data: {
        accessToken: `mock_jwt_access_token_renewed_${Date.now()}`,
        refreshToken: `mock_jwt_refresh_token_renewed_${Date.now()}`,
      },
    };
  }
}

