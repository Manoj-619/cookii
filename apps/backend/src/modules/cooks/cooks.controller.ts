import { Controller, Post, Get, Body, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CooksService } from './cooks.service';
import { CookOnboardDto, UploadDocumentDto, ToggleAvailabilityDto, UpdateLocationDto } from './dto/cooks.dto';

@ApiTags('Cooks')
@ApiBearerAuth()
@Controller('cooks')
export class CooksController {
  constructor(private readonly cooksService: CooksService) {}

  @Post('onboard')
  @ApiOperation({ summary: 'Submit cook partner onboarding application' })
  async onboard(@Headers('user-id') cookId: string, @Body() dto: CookOnboardDto) {
    return this.cooksService.onboard(cookId, dto);
  }

  @Post('documents')
  @ApiOperation({ summary: 'Upload KYC verification document' })
  async uploadDocument(@Headers('user-id') cookId: string, @Body() dto: UploadDocumentDto) {
    return this.cooksService.uploadDocument(cookId, dto);
  }

  @Post('me/availability')
  @ApiOperation({ summary: 'Toggle online / offline status' })
  async toggleAvailability(@Headers('user-id') cookId: string, @Body() dto: ToggleAvailabilityDto) {
    return this.cooksService.toggleAvailability(cookId, dto);
  }

  @Post('me/location')
  @ApiOperation({ summary: 'Publish live GPS coordinates' })
  async updateLocation(@Headers('user-id') cookId: string, @Body() dto: UpdateLocationDto) {
    return this.cooksService.updateLocation(cookId, dto);
  }

  @Get('me/earnings')
  @ApiOperation({ summary: 'Get cook partner earnings and payout summary' })
  async getEarnings(@Headers('user-id') cookId: string) {
    return this.cooksService.getEarnings(cookId);
  }
}

