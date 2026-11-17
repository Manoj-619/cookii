import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User, UserSchema } from '../users/schemas/user.schema';
import { OtpRecord, OtpSchema } from './schemas/otp.schema';
import { NotificationsModule } from '../notifications/notifications.module';
import { OTP_PROVIDER, createOtpProvider } from './otp.provider';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: OtpRecord.name, schema: OtpSchema },
    ]),
    NotificationsModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: OTP_PROVIDER,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => createOtpProvider(config),
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
