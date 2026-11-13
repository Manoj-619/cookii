import { Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CooksModule } from './modules/cooks/cooks.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { MatchingModule } from './modules/matching/matching.module';
import { PricingModule } from './modules/pricing/pricing.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ChatModule } from './modules/chat/chat.module';
import { RatingsModule } from './modules/ratings/ratings.module';
import { AdminModule } from './modules/admin/admin.module';

const logger = new Logger('AppModule');
const nodeEnv = process.env.NODE_ENV || 'development';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        `.env.${nodeEnv}`,
        '.env',
        `../../.env.${nodeEnv}`,
        '../../.env',
      ],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const uri = config.get<string>(
          'MONGODB_URI',
          'mongodb://127.0.0.1:27017/cookii_dev'
        );
        return {
          uri,
          serverSelectionTimeoutMS: 5000,
          connectionFactory: (connection) => {
            connection.on('connected', () => {
              const safeHost = uri.split('@').pop()?.split('/')[0] || 'localhost';
              logger.log(`✓ MongoDB Connected successfully to [${safeHost}]`);
            });
            connection.on('error', (err: any) => {
              logger.warn(`⚠ MongoDB connection issue: ${err.message}`);
            });
            return connection;
          },
        };
      },
    }),
    EventEmitterModule.forRoot(),
    AuthModule,
    UsersModule,
    CooksModule,
    BookingsModule,
    MatchingModule,
    PricingModule,
    PaymentsModule,
    NotificationsModule,
    ChatModule,
    RatingsModule,
    AdminModule,
  ],
})
export class AppModule {}


