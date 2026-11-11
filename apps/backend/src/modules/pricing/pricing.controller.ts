import { Controller, Post, Get, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PricingService } from './pricing.service';
import { CalculateFareDto, ValidateCouponDto } from './dto/pricing.dto';

@ApiTags('Pricing & Services')
@Controller()
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Get('services')
  @ApiOperation({ summary: 'List all available home cooking services' })
  async getServices() {
    return this.pricingService.getServicesList();
  }

  @Post('pricing/calculate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Calculate transparent fare breakdown' })
  @ApiResponse({ status: 200, description: 'Fare calculated' })
  async calculateFare(@Body() dto: CalculateFareDto) {
    return this.pricingService.calculateFare(dto);
  }

  @Post('pricing/coupon/validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate a discount coupon' })
  async validateCoupon(@Body() dto: ValidateCouponDto) {
    return this.pricingService.validateCoupon(dto);
  }
}

