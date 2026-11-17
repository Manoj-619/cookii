import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import {
  BookingStatus,
  ServiceType,
  PaymentMethod,
  PaymentStatus,
  ActorType,
  PricingBreakdown,
} from '@zapeat/shared-types';

export type BookingDocument = Booking & Document;

@Schema({ _id: false })
export class TimelineEvent {
  @Prop({ type: String, enum: BookingStatus })
  fromStatus?: BookingStatus;

  @Prop({ type: String, enum: BookingStatus, required: true })
  toStatus!: BookingStatus;

  @Prop({ type: String, enum: ActorType, required: true })
  actor!: ActorType;

  @Prop({ type: String, sparse: true })
  actorId?: string;

  @Prop({ type: String, sparse: true })
  reason?: string;

  @Prop({ type: Date, default: Date.now })
  timestamp!: Date;

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  metadata?: Record<string, any>;
}

export const TimelineEventSchema = SchemaFactory.createForClass(TimelineEvent);

@Schema({ _id: false })
export class BookingPricing implements Partial<PricingBreakdown> {
  @Prop({ type: Number, required: true, default: 299 })
  basePrice!: number;

  @Prop({ type: Number, default: 0 })
  perPersonAddOn!: number;

  @Prop({ type: Number, required: true, default: 2 })
  personCount!: number;

  @Prop({ type: Number, default: 1.0 })
  peakMultiplier!: number;

  @Prop({ type: Number, default: 0 })
  surgePrice!: number;

  @Prop({ type: Number, default: 1.0 })
  zoneMultiplier!: number;

  @Prop({ type: Number, default: 25 })
  platformFee!: number;

  @Prop({ type: Number, default: 16.2 })
  gstAmount!: number;

  @Prop({ type: Number, default: 0 })
  discountAmount!: number;

  @Prop({ type: String, sparse: true })
  couponCode?: string;

  @Prop({ type: Number, required: true, default: 340.2 })
  totalCustomerPayable!: number;

  @Prop({ type: Number, required: true, default: 240 })
  cookPayoutAmount!: number;

  @Prop({ type: Number, default: 0.15 })
  platformTakeRate!: number;
}

export const BookingPricingSchema = SchemaFactory.createForClass(BookingPricing);

@Schema({ timestamps: true, collection: 'bookings' })
export class Booking {
  @Prop({ type: String, required: true, unique: true, index: true })
  bookingNumber!: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  customer!: Types.ObjectId;

  @Prop({ type: String, required: true, index: true })
  customerId!: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', sparse: true, index: true })
  cook?: Types.ObjectId;

  @Prop({ type: String, sparse: true, index: true })
  cookId?: string;

  @Prop({ type: String, sparse: true })
  addressId?: string;

  @Prop({ type: String, sparse: true })
  addressSummary?: string;

  @Prop({
    type: String,
    enum: ServiceType,
    required: true,
    default: ServiceType.LUNCH,
  })
  serviceType!: ServiceType;

  @Prop({ type: [String], default: [] })
  cuisinesSelected!: string[];

  @Prop({ type: Number, required: true, default: 2 })
  personCount!: number;

  @Prop({ type: String, default: '' })
  dietaryNotes!: string;

  @Prop({ type: Date, required: true, index: true })
  scheduledStartTime!: Date;

  @Prop({
    type: String,
    enum: BookingStatus,
    default: BookingStatus.CREATED,
    index: true,
  })
  status!: BookingStatus;

  @Prop({ type: String, required: true })
  startOtp!: string;

  @Prop({ type: BookingPricingSchema, required: true })
  pricing!: BookingPricing;

  @Prop({
    type: String,
    enum: PaymentMethod,
    default: PaymentMethod.UPI,
  })
  paymentMethod!: PaymentMethod;

  @Prop({
    type: String,
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
    index: true,
  })
  paymentStatus!: PaymentStatus;

  @Prop({ type: String, sparse: true })
  razorpayOrderId?: string;

  @Prop({ type: String, sparse: true })
  razorpayPaymentId?: string;

  @Prop({ type: [TimelineEventSchema], default: [] })
  timeline!: TimelineEvent[];

  @Prop({ type: String, sparse: true })
  cancellationReason?: string;

  @Prop({ type: String, enum: ActorType, sparse: true })
  cancelledBy?: ActorType;

  @Prop({ type: Date, sparse: true })
  cancelledAt?: Date;

  @Prop({ type: Date, sparse: true })
  completedAt?: Date;

  /**
   * Optional TTL timestamp: MongoDB automatically deletes documents when expiresAt is reached.
   * Useful for purging abandoned draft bookings or old transient test data.
   */
  @Prop({ type: Date, sparse: true, expires: 0 })
  expiresAt?: Date;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);

// Compound indexes for high-throughput queries
BookingSchema.index({ customerId: 1, status: 1 });
BookingSchema.index({ cookId: 1, status: 1 });
BookingSchema.index({ scheduledStartTime: 1, status: 1 });
BookingSchema.index({ createdAt: -1 });
