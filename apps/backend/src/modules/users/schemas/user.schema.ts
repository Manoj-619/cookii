import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from '@cookii/shared-types';

export type UserDocument = User & Document;

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ type: String, sparse: true, index: true })
  phone?: string;

  @Prop({ type: String, sparse: true, index: true, lowercase: true, trim: true })
  email?: string;

  @Prop({ type: String, required: true, default: 'Cookii Diner' })
  name!: string;

  @Prop({ type: String, enum: UserRole, default: UserRole.CUSTOMER })
  role!: UserRole;

  @Prop({ type: String, enum: ['phone', 'google', 'guest'], default: 'phone' })
  provider!: string;

  @Prop({ type: String, sparse: true })
  googleId?: string;

  @Prop({ type: String, default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200' })
  avatarUrl?: string;

  @Prop({ type: Boolean, default: false })
  isPhoneVerified!: boolean;

  @Prop({ type: Boolean, default: false })
  isEmailVerified!: boolean;

  @Prop({ type: Number, default: 0 })
  walletBalance!: number;

  @Prop({ type: String, select: false })
  passwordHash?: string;

  @Prop({ type: String, sparse: true })
  fcmToken?: string;

  @Prop({ type: String, sparse: true })
  deviceToken?: string;

  @Prop({ type: String, enum: ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'SUSPENDED'], default: 'DRAFT' })
  verificationStatus?: string;

  @Prop({ type: [String], default: [] })
  cuisines?: string[];

  @Prop({ type: [String], default: [] })
  languages?: string[];

  @Prop({ type: Boolean, default: false })
  isOnline?: boolean;

  @Prop({ type: Number, default: 4.8 })
  ratingAverage?: number;

  @Prop({ type: Number, default: 0 })
  totalCompletedJobs?: number;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Compound indexes for high-throughput queries
UserSchema.index({ phone: 1 }, { sparse: true });
UserSchema.index({ email: 1 }, { sparse: true });
UserSchema.index({ googleId: 1 }, { sparse: true });

