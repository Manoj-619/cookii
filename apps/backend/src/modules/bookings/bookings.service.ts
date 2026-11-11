import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { CreateBookingDto, CancelBookingDto, VerifyStartOtpDto } from './dto/bookings.dto';
import { BookingStatus, VALID_BOOKING_TRANSITIONS, ActorType } from '@cookii/shared-types';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  // In-memory mock store for Phase 0 demonstration
  private bookings: Map<string, any> = new Map();

  async createBooking(customerId: string, dto: CreateBookingDto) {
    const bookingId = `bk_${Date.now()}`;
    const bookingNumber = `CK-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const startOtp = String(Math.floor(1000 + Math.random() * 9000));

    const initialStatus = BookingStatus.SEARCHING;

    const newBooking = {
      id: bookingId,
      bookingNumber,
      customerId: customerId || 'cust_101',
      cookId: null,
      addressId: dto.addressId,
      serviceType: dto.serviceType,
      cuisinesSelected: dto.cuisinesSelected,
      personCount: dto.personCount,
      dietaryNotes: dto.dietaryNotes || '',
      scheduledStartTime: dto.scheduledStartTime,
      status: initialStatus,
      startOtp, // Returned to customer
      pricing: {
        basePrice: 299,
        perPersonAddOn: 0,
        personCount: dto.personCount,
        platformFee: 25,
        gstAmount: 16.2,
        discountAmount: dto.couponCode ? 50 : 0,
        totalCustomerPayable: dto.couponCode ? 290.2 : 340.2,
        cookPayoutAmount: 240,
      },
      paymentMethod: dto.paymentMethod,
      paymentStatus: 'PAID',
      timeline: [
        {
          fromStatus: undefined,
          toStatus: BookingStatus.CREATED,
          actor: ActorType.CUSTOMER,
          timestamp: new Date().toISOString(),
          reason: 'Booking initiated by customer',
        },
        {
          fromStatus: BookingStatus.CREATED,
          toStatus: BookingStatus.SEARCHING,
          actor: ActorType.SYSTEM,
          timestamp: new Date().toISOString(),
          reason: 'Searching for verified nearby cooks in Bengaluru',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.bookings.set(bookingId, newBooking);
    this.logger.log(`Created booking ${bookingNumber} [${bookingId}] for customer ${customerId}`);

    return {
      success: true,
      data: newBooking,
    };
  }

  async getBooking(id: string) {
    const booking = this.bookings.get(id);
    if (!booking) {
      // Return a realistic seeded booking for testing
      return {
        success: true,
        data: {
          id,
          bookingNumber: 'CK-202611-4819',
          status: BookingStatus.ASSIGNED,
          serviceType: 'LUNCH',
          scheduledStartTime: '2026-11-12T13:00:00.000Z',
          startOtp: '4921',
          pricing: {
            totalCustomerPayable: 290.2,
            cookPayoutAmount: 240.0,
          },
          cook: {
            id: 'cook_sita_101',
            name: 'Sita Lakshmi',
            phone: '+91-80-XXXX-1234 (Masked)',
            ratingAverage: 4.92,
            totalBookingsCompleted: 312,
            languages: ['Kannada', 'Hindi', 'English'],
            etaMinutes: 12,
          },
        },
      };
    }
    return { success: true, data: booking };
  }

  async listBookings(userId: string, role: string) {
    return {
      success: true,
      data: [
        {
          id: 'bk_active_1',
          bookingNumber: 'CK-202611-4819',
          status: BookingStatus.ASSIGNED,
          serviceType: 'LUNCH',
          personCount: 2,
          scheduledStartTime: '2026-11-12T13:00:00.000Z',
          totalAmount: 290.2,
          cookName: 'Sita Lakshmi',
          addressSummary: '4th Block, Koramangala',
        },
        {
          id: 'bk_past_1',
          bookingNumber: 'CK-202611-1022',
          status: BookingStatus.COMPLETED,
          serviceType: 'BREAKFAST',
          personCount: 3,
          scheduledStartTime: '2026-11-10T08:30:00.000Z',
          totalAmount: 340.0,
          cookName: 'Lakshmamma R.',
          addressSummary: 'Indiranagar 100ft Rd',
        },
      ],
    };
  }

  async verifyOtp(bookingId: string, dto: VerifyStartOtpDto) {
    const booking = this.bookings.get(bookingId);
    if (booking && booking.startOtp !== dto.otp) {
      throw new BadRequestException('Incorrect start OTP provided by customer');
    }

    this.logger.log(`Doorstep OTP verified for booking ${bookingId}`);
    return {
      success: true,
      data: {
        bookingId,
        status: BookingStatus.IN_PROGRESS,
        verifiedAt: new Date().toISOString(),
        message: 'Doorstep handshake verified. Cooking started!',
      },
    };
  }

  async completeService(bookingId: string) {
    this.logger.log(`Service completed for booking ${bookingId}`);
    return {
      success: true,
      data: {
        bookingId,
        status: BookingStatus.COMPLETED,
        completedAt: new Date().toISOString(),
        message: 'Cooking session completed. Invoice is ready.',
      },
    };
  }

  async cancelBooking(bookingId: string, actor: ActorType, dto: CancelBookingDto) {
    this.logger.log(`Booking ${bookingId} cancelled by ${actor} for: ${dto.reason}`);
    return {
      success: true,
      data: {
        bookingId,
        status: BookingStatus.CANCELLED,
        cancellationFee: 0,
        cancelledAt: new Date().toISOString(),
        reason: dto.reason,
      },
    };
  }
}

