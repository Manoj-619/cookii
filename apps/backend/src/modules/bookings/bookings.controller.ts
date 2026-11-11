import { Controller, Post, Get, Body, Param, Headers, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto, CancelBookingDto, VerifyStartOtpDto } from './dto/bookings.dto';
import { ActorType } from '@cookii/shared-types';

@ApiTags('Bookings')
@ApiBearerAuth()
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new scheduled or instant booking' })
  async createBooking(@Headers('user-id') customerId: string, @Body() dto: CreateBookingDto) {
    return this.bookingsService.createBooking(customerId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List user bookings' })
  async listBookings(
    @Headers('user-id') userId: string,
    @Headers('user-role') role: string = 'CUSTOMER',
  ) {
    return this.bookingsService.listBookings(userId, role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking details by ID' })
  async getBooking(@Param('id') id: string) {
    return this.bookingsService.getBooking(id);
  }

  @Post(':id/verify-otp')
  @ApiOperation({ summary: 'Cook enters customer doorstep 4-digit OTP to start service' })
  async verifyOtp(@Param('id') id: string, @Body() dto: VerifyStartOtpDto) {
    return this.bookingsService.verifyOtp(id, dto);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Cook marks service completed' })
  async completeService(@Param('id') id: string) {
    return this.bookingsService.completeService(id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel booking with reason' })
  async cancelBooking(
    @Param('id') id: string,
    @Headers('actor-type') actor: ActorType = ActorType.CUSTOMER,
    @Body() dto: CancelBookingDto,
  ) {
    return this.bookingsService.cancelBooking(id, actor, dto);
  }
}

