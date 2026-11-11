import { Controller, Post, Body, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RatingsService } from './ratings.service';
import { SubmitRatingDto } from './dto/ratings.dto';

@ApiTags('Ratings & Reviews')
@ApiBearerAuth()
@Controller('ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post()
  @ApiOperation({ summary: 'Submit rating, review chips, and tip for completed booking' })
  async submitRating(@Headers('user-id') customerId: string, @Body() dto: SubmitRatingDto) {
    return this.ratingsService.submitRating(customerId, dto);
  }
}

