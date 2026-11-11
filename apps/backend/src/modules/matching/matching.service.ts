import { Injectable, Logger } from '@nestjs/common';
import { JobOfferStatus } from '@cookii/shared-types';

@Injectable()
export class MatchingService {
  private readonly logger = new Logger(MatchingService.name);

  async getActiveOffersForCook(cookId: string) {
    return {
      success: true,
      data: [
        {
          id: 'offer_8492',
          bookingId: 'bk_202611_4819',
          distanceKm: 1.8,
          estimatedEarnings: 350.0,
          serviceType: 'LUNCH',
          personCount: 3,
          cuisines: ['South Indian', 'Karnataka Special'],
          addressSummary: 'Near Sony Signal, Koramangala',
          status: JobOfferStatus.PENDING,
          offeredAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 25 * 1000).toISOString(), // 25 seconds countdown
        },
      ],
    };
  }

  async respondToOffer(offerId: string, cookId: string, action: 'ACCEPT' | 'DECLINE') {
    this.logger.log(`Cook ${cookId} responded to offer ${offerId}: ${action}`);
    return {
      success: true,
      data: {
        offerId,
        status: action === 'ACCEPT' ? JobOfferStatus.ACCEPTED : JobOfferStatus.DECLINED,
        respondedAt: new Date().toISOString(),
        message: action === 'ACCEPT' ? 'Job accepted! Navigate to customer address.' : 'Offer declined.',
      },
    };
  }

  async triggerMatching(bookingId: string) {
    this.logger.log(`Triggered matching radar for booking ${bookingId}`);
    return {
      success: true,
      data: {
        bookingId,
        eligibleCooksCount: 4,
        searchRadiusKm: 5.0,
        dispatchedTo: 'cook_sita_101',
        timeoutSeconds: 25,
      },
    };
  }
}

