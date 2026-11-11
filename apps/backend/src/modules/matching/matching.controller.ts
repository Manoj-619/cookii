import { Controller, Get, Post, Param, Body, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiProperty } from '@nestjs/swagger';
import { MatchingService } from './matching.service';
import { IsNotEmpty, IsEnum } from 'class-validator';

class RespondOfferDto {
  @ApiProperty({ enum: ['ACCEPT', 'DECLINE'], example: 'ACCEPT' })
  @IsNotEmpty()
  @IsEnum(['ACCEPT', 'DECLINE'])
  action!: 'ACCEPT' | 'DECLINE';
}

@ApiTags('Matching & Job Offers')
@ApiBearerAuth()
@Controller()
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Get('cooks/me/job-offers')
  @ApiOperation({ summary: 'Get active incoming job offers for authenticated cook' })
  async getOffers(@Headers('user-id') cookId: string) {
    return this.matchingService.getActiveOffersForCook(cookId);
  }

  @Post('cooks/job-offers/:id/respond')
  @ApiOperation({ summary: 'Accept or decline job offer with 25s timeout' })
  async respondOffer(
    @Param('id') offerId: string,
    @Headers('user-id') cookId: string,
    @Body() dto: RespondOfferDto,
  ) {
    return this.matchingService.respondToOffer(offerId, cookId, dto.action);
  }

  @Post('matching/trigger/:bookingId')
  @ApiOperation({ summary: 'Trigger matching engine for a booking' })
  async triggerMatching(@Param('bookingId') bookingId: string) {
    return this.matchingService.triggerMatching(bookingId);
  }
}

