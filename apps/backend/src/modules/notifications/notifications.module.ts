import { Injectable, Logger, Module } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  async sendPushNotification(deviceToken: string, title: string, body: string, data?: Record<string, string>) {
    this.logger.log(`[FCM Mock] Push to ${deviceToken.slice(0, 10)}...: "${title}" - "${body}"`);
    return { success: true };
  }

  async sendSms(phone: string, text: string) {
    this.logger.log(`[SMS Mock] SMS to ${phone}: "${text}"`);
    return { success: true };
  }
}

@Module({
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}

