import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Headers,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import {
  AdminLoginDto,
  RejectCookDto,
  VerifyCookDto,
} from './dto/admin.dto';
import { AdminGuard } from '../../common/guards/admin.guard';

@ApiTags('Admin Operations')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * Public admin authentication endpoint
   */
  @Post('auth/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin/Operations staff login' })
  @ApiResponse({ status: 200, description: 'Authenticated successfully, returns admin JWT' })
  async login(@Body() dto: AdminLoginDto) {
    return this.adminService.login(dto);
  }

  /**
   * Dashboard operational KPIs
   */
  @Get('stats')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get live dashboard operational KPIs' })
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  /**
   * Paginated bookings
   */
  @Get('bookings')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List paginated platform bookings' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'status', required: false, type: String })
  async getBookings(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.adminService.getBookings(pageNum, limitNum, status);
  }

  /**
   * Paginated cooks with KYC status
   */
  @Get('cooks')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List cooks with verification and KYC status' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'verificationStatus', required: false, type: String })
  async getCooks(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('verificationStatus') verificationStatus?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.adminService.getCooks(pageNum, limitNum, verificationStatus);
  }

  /**
   * Paginated customers
   */
  @Get('customers')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List paginated customer profiles' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  async getCustomers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.adminService.getCustomers(pageNum, limitNum);
  }

  /**
   * Paginated payments
   */
  @Get('payments')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List paginated payment transactions' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  async getPayments(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.adminService.getPayments(pageNum, limitNum);
  }

  /**
   * Approve cook verification
   */
  @Post('cooks/:id/approve')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve cook application and verify profile' })
  async approveCook(@Param('id') cookId: string) {
    return this.adminService.approveCook(cookId);
  }

  /**
   * Reject cook verification with reason
   */
  @Post('cooks/:id/reject')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reject cook application with feedback reason' })
  async rejectCook(
    @Param('id') cookId: string,
    @Body() dto: RejectCookDto,
  ) {
    return this.adminService.rejectCook(cookId, dto.reason);
  }

  /**
   * Suspend cook account
   */
  @Post('cooks/:id/suspend')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Suspend a cook account' })
  async suspendCook(@Param('id') cookId: string) {
    return this.adminService.suspendCook(cookId);
  }

  // Backward compatible legacy operations endpoints:

  @Get('cooks/verification-queue')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List pending cook verification applications' })
  async getVerificationQueue() {
    return this.adminService.getVerificationQueue();
  }

  @Post('cooks/:id/verify')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve or reject cook verification application' })
  async verifyCook(
    @Param('id') cookId: string,
    @Headers('user-id') adminId: string,
    @Body() dto: VerifyCookDto,
  ) {
    return this.adminService.verifyCook(cookId, adminId, dto);
  }

  @Get('bookings/live-map')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get active Bengaluru cooks and bookings for live operations map' })
  async getLiveOpsMap() {
    return this.adminService.getLiveOpsMap();
  }

  @Get('audit-logs')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get admin actions audit log' })
  async getAuditLogs() {
    return this.adminService.getAuditLogs();
  }
}
