import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type NotificationLogDocument = NotificationLog & Document;

export enum NotificationType {
  PUSH = 'PUSH',
  TOPIC = 'TOPIC',
  BATCH = 'BATCH',
  EMAIL = 'EMAIL',
  SMS = 'SMS',
}

export enum NotificationDeliveryStatus {
  DELIVERED = 'DELIVERED',
  SENT = 'SENT',
  FAILED = 'FAILED',
  FALLBACK_LOGGED = 'FALLBACK_LOGGED',
}

@Schema({ timestamps: true, collection: 'notification_logs' })
export class NotificationLog {
  @Prop({ type: String, sparse: true, index: true })
  userId?: string;

  @Prop({ type: String, sparse: true })
  deviceToken?: string;

  @Prop({ type: String, sparse: true, index: true })
  topic?: string;

  @Prop({ type: String, required: true })
  title!: string;

  @Prop({ type: String, required: true })
  body!: string;

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  data?: Record<string, any>;

  @Prop({
    type: String,
    enum: NotificationType,
    default: NotificationType.PUSH,
  })
  type!: NotificationType;

  @Prop({
    type: String,
    enum: NotificationDeliveryStatus,
    default: NotificationDeliveryStatus.DELIVERED,
    index: true,
  })
  status!: NotificationDeliveryStatus;

  @Prop({ type: String, sparse: true })
  error?: string;

  @Prop({ type: Date, default: Date.now })
  sentAt!: Date;
}

export const NotificationLogSchema = SchemaFactory.createForClass(NotificationLog);
NotificationLogSchema.index({ userId: 1, createdAt: -1 });
NotificationLogSchema.index({ createdAt: -1 });
