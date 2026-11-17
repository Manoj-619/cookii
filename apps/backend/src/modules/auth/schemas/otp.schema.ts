import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OtpDocument = OtpRecord & Document;

@Schema({ timestamps: true, collection: 'otps' })
export class OtpRecord {
  @Prop({ type: String, sparse: true, index: true })
  phone?: string;

  @Prop({ type: String, sparse: true, index: true, lowercase: true, trim: true })
  email?: string;

  @Prop({ type: String, required: true })
  otpCode!: string;

  @Prop({ type: Number, default: 0 })
  attempts!: number;

  @Prop({ type: Boolean, default: false })
  isConsumed!: boolean;

  // TTL index: MongoDB automatically removes expired OTPs when this timestamp is reached
  @Prop({ type: Date, required: true, expires: 0 })
  expiresAt!: Date;
}

export const OtpSchema = SchemaFactory.createForClass(OtpRecord);
OtpSchema.index({ phone: 1, isConsumed: 1 });
OtpSchema.index({ email: 1, isConsumed: 1 });

