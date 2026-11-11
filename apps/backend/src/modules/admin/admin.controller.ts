import { Controller, Get, Post, Param, Body, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { VerifyCookDto } from './dto/admin.dto';

@ApiTags('Admin Operations')
@ApiBearerAuth()
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('cooks/verification-queue')
  @ApiOperation({ summary: 'List pending cook verification applications' })
  async getVerificationQueue() {
    return this.adminService.getVerificationQueue();
  }

  @Post('cooks/:id/verify')
  @ApiOperation({ summary: 'Approve or reject cook verification application' })
  async verifyCook(
    @Param('id') cookId: string,
    @Headers('user-id') adminId: string,
    @Body() dto: VerifyCookDto,
  ) {
    return this.adminService.verifyCook(cookId, adminId, dto);
  }

  @Get('bookings/live-map')
  @ApiOperation({ summary: 'Get active Bengaluru cooks and bookings for live operations map' })
  async getLiveOpsMap() {
    return this.adminService.getLiveOpsMap();
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Get admin actions audit log' })
  async getAuditLogs() {
    return this.adminService.getAuditLogs();
  }
}

