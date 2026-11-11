import { Injectable, BadRequestException } from '@nestjs/common';
import { CalculateFareDto, ValidateCouponDto } from './dto/pricing.dto';
import { ServiceType, PricingBreakdown } from '@cookii/shared-types';

@Injectable()
export class PricingService {
  private readonly baseRates: Record<ServiceType, { baseFare: number; basePersons: number; perExtraPerson: number }> = {
    [ServiceType.BREAKFAST]: { baseFare: 249, basePersons: 2, perExtraPerson: 40 },
    [ServiceType.LUNCH]: { baseFare: 299, basePersons: 2, perExtraPerson: 50 },
    [ServiceType.DINNER]: { baseFare: 329, basePersons: 2, perExtraPerson: 50 },
    [ServiceType.FULL_DAY]: { baseFare: 899, basePersons: 2, perExtraPerson: 100 },
    [ServiceType.PARTY_SPECIAL]: { baseFare: 1499, basePersons: 4, perExtraPerson: 120 },
  };

  calculateFare(dto: CalculateFareDto): { success: true; data: PricingBreakdown } {
    const rate = this.baseRates[dto.serviceType];
    const extraPersons = Math.max(0, dto.personCount - rate.basePersons);
    const perPersonAddOn = extraPersons * rate.perExtraPerson;

    // Time-of-day / surge logic (mocked or config-driven)
    const peakMultiplier = 1.0;
    const surgePrice = 0;
    const zoneMultiplier = 1.0;
    const platformFee = 25.0;

    let subtotal = (rate.baseFare + perPersonAddOn) * peakMultiplier * zoneMultiplier + surgePrice + platformFee;

    // Coupon discount calculation
    let discountAmount = 0;
    if (dto.couponCode && dto.couponCode.toUpperCase() === 'NAMMACOOKII') {
      discountAmount = Math.min(50, subtotal * 0.2);
    }

    const gstAmount = Math.round((subtotal - discountAmount) * 0.05 * 100) / 100;
    const totalCustomerPayable = Math.round((subtotal - discountAmount + gstAmount) * 100) / 100;

    // Cook payout calculation (80% take rate to cook)
    const cookPayoutAmount = Math.round((rate.baseFare + perPersonAddOn) * 0.8 * 100) / 100;
    const platformTakeRate = 0.2;

    return {
      success: true,
      data: {
        basePrice: rate.baseFare,
        perPersonAddOn,
        personCount: dto.personCount,
        peakMultiplier,
        surgePrice,
        zoneMultiplier,
        platformFee,
        gstAmount,
        discountAmount,
        couponCode: dto.couponCode,
        totalCustomerPayable,
        cookPayoutAmount,
        platformTakeRate,
      },
    };
  }

  validateCoupon(dto: ValidateCouponDto) {
    if (dto.code.toUpperCase() === 'NAMMACOOKII') {
      return {
        success: true,
        data: {
          code: 'NAMMACOOKII',
          discountPercentage: 20,
          maxDiscount: 50,
          description: 'Flat 20% off up to ₹50 for Bengaluru foodies',
        },
      };
    }
    throw new BadRequestException('Invalid or expired coupon code');
  }

  getServicesList() {
    return {
      success: true,
      data: [
        {
          id: 'srv_breakfast',
          type: ServiceType.BREAKFAST,
          title: 'Morning Breakfast',
          tagline: 'Fresh crisp dosas, idlis, poha & filter coffee',
          basePrice: 249,
          estimatedMinutes: 60,
          badge: 'Most Popular in Koramangala',
        },
        {
          id: 'srv_lunch',
          type: ServiceType.LUNCH,
          title: 'Afternoon Lunch',
          tagline: 'Warm rotis, dal tadka, fresh sabzi & rice',
          basePrice: 299,
          estimatedMinutes: 75,
          badge: 'Homestyle Comfort',
        },
        {
          id: 'srv_dinner',
          type: ServiceType.DINNER,
          title: 'Evening Dinner',
          tagline: 'Wholesome light curries, phulkas & khichdi',
          basePrice: 329,
          estimatedMinutes: 75,
          badge: 'Calm & Nutritious',
        },
        {
          id: 'srv_fullday',
          type: ServiceType.FULL_DAY,
          title: 'Full Day Cook Partner',
          tagline: 'All 3 meals prepared + kitchen tidied up',
          basePrice: 899,
          estimatedMinutes: 240,
          badge: 'Complete Peace of Mind',
        },
      ],
    };
  }
}

