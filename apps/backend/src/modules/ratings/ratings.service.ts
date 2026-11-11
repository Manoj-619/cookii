import { Injectable, Logger } from '@nestjs/common';
import { SubmitRatingDto } from './dto/ratings.dto';

@Injectable()
export class RatingsService {
  private readonly logger = new Logger(RatingsService.name);

  async submitRating(customerId: string, dto: SubmitRatingDto) {
    this.logger.log(`Customer ${customerId} submitted ${dto.rating}★ for booking ${dto.bookingId}`);
    return {
      success: true,
      data: {
        id: `review_${Date.now()}`,
        bookingId: dto.bookingId,
        customerId,
        rating: dto.rating,
        tags: dto.tags || [],
        comment: dto.comment || null,
        tipAmount: dto.tipAmount || 0,
        createdAt: new Date().toISOString(),
      },
    };
  }
}

