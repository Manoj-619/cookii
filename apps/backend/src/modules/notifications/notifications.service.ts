import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import {
  NotificationLog,
  NotificationLogDocument,
  NotificationType,
  NotificationDeliveryStatus,
} from './schemas/notification.schema';
import { User, UserDocument } from '../users/schemas/user.schema';

export interface BatchNotificationItem {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private firebaseApp: App | null = null;
  private isFcmConfigured: boolean = false;

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(NotificationLog.name)
    private readonly logModel: Model<NotificationLogDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {
    this.initializeFirebase();
  }

  /**
   * Initializes Firebase Admin SDK with project credentials or service account
   */
  private initializeFirebase() {
    try {
      const existingApps = getApps();
      if (existingApps.length > 0) {
        this.firebaseApp = existingApps[0]!;
        this.isFcmConfigured = true;
        this.logger.log('✓ Reusing initialized Firebase Admin instance');
        return;
      }

      const projectId =
        this.configService.get<string>('FCM_PROJECT_ID') ||
        this.configService.get<string>('FIREBASE_PROJECT_ID');
      const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');
      let privateKey = this.configService.get<string>('FIREBASE_PRIVATE_KEY');
      const serviceAccountJson = this.configService.get<string>('FIREBASE_SERVICE_ACCOUNT');

      if (serviceAccountJson) {
        const credentials = JSON.parse(serviceAccountJson);
        this.firebaseApp = initializeApp({
          credential: cert(credentials),
        });
        this.isFcmConfigured = true;
        this.logger.log('✓ Firebase Admin initialized from FIREBASE_SERVICE_ACCOUNT JSON');
      } else if (projectId && clientEmail && privateKey) {
        privateKey = privateKey.replace(/\\n/g, '\n');
        this.firebaseApp = initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        });
        this.isFcmConfigured = true;
        this.logger.log(`✓ Firebase Admin initialized for project: ${projectId}`);
      } else {
        this.isFcmConfigured = false;
        this.logger.log(
          'ℹ Firebase Admin credentials not provided in environment. NotificationsService running in structured log fallback mode.'
        );
      }
    } catch (err: any) {
      this.isFcmConfigured = false;
      this.logger.warn(`Firebase Admin initialization note: ${err.message}. Using fallback logger.`);
    }
  }

  /**
   * Sends a targeted push notification to a specific user by userId
   */
  async sendPush(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<{ success: boolean; messageId?: string; fallback?: boolean }> {
    let deviceToken: string | undefined;

    // Look up user device or FCM token from MongoDB
    try {
      const user = await this.userModel.findById(userId).select('fcmToken deviceToken phone name').lean();
      deviceToken = user?.fcmToken || user?.deviceToken;
    } catch (err: any) {
      this.logger.debug(`User token lookup error for ${userId}: ${err.message}`);
    }

    // If userId was directly passed as a device token string
    if ((!deviceToken && userId.startsWith('fcm_')) || (!deviceToken && userId.length > 50)) {
      deviceToken = userId;
    }

    if (this.isFcmConfigured && deviceToken) {
      try {
        const messaging = getMessaging(this.firebaseApp!);
        const response = await messaging.send({
          token: deviceToken,
          notification: { title, body },
          data: data || {},
        });

        await this.logNotification({
          userId,
          deviceToken,
          title,
          body,
          data,
          type: NotificationType.PUSH,
          status: NotificationDeliveryStatus.DELIVERED,
        });

        this.logger.log(`✓ Push delivered to user ${userId} (FCM messageId: ${response})`);
        return { success: true, messageId: response };
      } catch (err: any) {
        this.logger.error(`FCM sendPush failed for user ${userId}: ${err.message}`);

        await this.logNotification({
          userId,
          deviceToken,
          title,
          body,
          data,
          type: NotificationType.PUSH,
          status: NotificationDeliveryStatus.FAILED,
          error: err.message,
        });

        return { success: false, fallback: false };
      }
    }

    // Graceful fallback: log notification and persist log to MongoDB
    this.logger.log(
      `[FCM Fallback] sendPush to user "${userId}": "${title}" - "${body}" (data: ${JSON.stringify(data || {})})`
    );

    await this.logNotification({
      userId,
      deviceToken,
      title,
      body,
      data,
      type: NotificationType.PUSH,
      status: NotificationDeliveryStatus.FALLBACK_LOGGED,
      error: !deviceToken ? 'No active FCM device token registered for user' : undefined,
    });

    return { success: true, fallback: true };
  }

  /**
   * Sends a push notification to all subscribers of a specific FCM topic
   */
  async sendToTopic(
    topic: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<{ success: boolean; messageId?: string; fallback?: boolean }> {
    if (this.isFcmConfigured) {
      try {
        const messaging = getMessaging(this.firebaseApp!);
        const response = await messaging.send({
          topic,
          notification: { title, body },
          data: data || {},
        });

        await this.logNotification({
          topic,
          title,
          body,
          data,
          type: NotificationType.TOPIC,
          status: NotificationDeliveryStatus.DELIVERED,
        });

        this.logger.log(`✓ Topic broadcast delivered to /topics/${topic} (messageId: ${response})`);
        return { success: true, messageId: response };
      } catch (err: any) {
        this.logger.error(`FCM sendToTopic failed for topic "${topic}": ${err.message}`);

        await this.logNotification({
          topic,
          title,
          body,
          data,
          type: NotificationType.TOPIC,
          status: NotificationDeliveryStatus.FAILED,
          error: err.message,
        });

        return { success: false, fallback: false };
      }
    }

    // Fallback logging
    this.logger.log(
      `[FCM Fallback] sendToTopic "/topics/${topic}": "${title}" - "${body}"`
    );

    await this.logNotification({
      topic,
      title,
      body,
      data,
      type: NotificationType.TOPIC,
      status: NotificationDeliveryStatus.FALLBACK_LOGGED,
    });

    return { success: true, fallback: true };
  }

  /**
   * Dispatches notifications to multiple users in batch
   */
  async sendBatch(
    notifications: BatchNotificationItem[],
  ): Promise<{ total: number; delivered: number; fallbackOrFailed: number }> {
    let deliveredCount = 0;
    let fallbackOrFailedCount = 0;

    const promises = notifications.map(async (item) => {
      try {
        const res = await this.sendPush(item.userId, item.title, item.body, item.data);
        if (res.success && !res.fallback) {
          deliveredCount++;
        } else {
          fallbackOrFailedCount++;
        }
      } catch (err: any) {
        fallbackOrFailedCount++;
      }
    });

    await Promise.allSettled(promises);
    this.logger.log(
      `Batch push dispatched: ${notifications.length} total, ${deliveredCount} delivered, ${fallbackOrFailedCount} fallback/failed`
    );

    return {
      total: notifications.length,
      delivered: deliveredCount,
      fallbackOrFailed: fallbackOrFailedCount,
    };
  }

  /**
   * Backward-compatible legacy push notification helper
   */
  async sendPushNotification(
    deviceToken: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ) {
    if (this.isFcmConfigured && this.firebaseApp) {
      try {
        const messaging = getMessaging(this.firebaseApp);
        const messageId = await messaging.send({
          token: deviceToken,
          notification: { title, body },
          data: data || {},
        });
        return { success: true, messageId };
      } catch (err: any) {
        this.logger.warn(`Push to token ${deviceToken.slice(0, 10)} failed: ${err.message}`);
      }
    }

    this.logger.log(`[FCM Mock] Push to ${deviceToken.slice(0, 10)}...: "${title}" - "${body}"`);
    return { success: true, fallback: true };
  }

  /**
   * Legacy SMS dispatch helper
   */
  async sendSms(phone: string, text: string) {
    this.logger.log(`[SMS Mock] SMS to ${phone}: "${text}"`);
    await this.logNotification({
      title: 'SMS Alert',
      body: text,
      type: NotificationType.SMS,
      status: NotificationDeliveryStatus.FALLBACK_LOGGED,
      data: { phone },
    });
    return { success: true };
  }

  /**
   * Logs a notification record into MongoDB
   */
  private async logNotification(entry: Partial<NotificationLog>): Promise<void> {
    try {
      await this.logModel.create({
        ...entry,
        sentAt: new Date(),
      });
    } catch (err: any) {
      this.logger.warn(`Could not persist notification log: ${err.message}`);
    }
  }
}
