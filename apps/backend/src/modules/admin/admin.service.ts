import { Injectable, Logger } from '@nestjs/common';
import { VerifyCookDto } from './dto/admin.dto';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  async getVerificationQueue() {
    return {
      success: true,
      data: [
        {
          id: 'cook_app_201',
          userId: 'user_cook_201',
          cookName: 'Manjula Gowda',
          phone: '+919845012345',
          cuisines: ['South Indian', 'Karnataka Special'],
          languages: ['Kannada', 'Telugu'],
          aadhaarUrl: 'https://res.cloudinary.com/cookii/docs/aadhaar_201.jpg',
          policeVerificationUrl: 'https://res.cloudinary.com/cookii/docs/police_201.pdf',
          submittedAt: '2026-11-11T09:30:00.000Z',
          status: 'UNDER_REVIEW',
        },
        {
          id: 'cook_app_202',
          userId: 'user_cook_202',
          cookName: 'Rajesh Sharma',
          phone: '+919980112233',
          cuisines: ['North Indian', 'Continental'],
          languages: ['Hindi', 'English'],
          aadhaarUrl: 'https://res.cloudinary.com/cookii/docs/aadhaar_202.jpg',
          policeVerificationUrl: 'https://res.cloudinary.com/cookii/docs/police_202.pdf',
          submittedAt: '2026-11-11T10:15:00.000Z',
          status: 'UNDER_REVIEW',
        },
      ],
    };
  }

  async verifyCook(cookId: string, adminId: string, dto: VerifyCookDto) {
    this.logger.log(`Admin ${adminId} ${dto.decision} cook ${cookId} (remarks: ${dto.remarks})`);
    return {
      success: true,
      data: {
        cookId,
        verificationStatus: dto.decision === 'APPROVED' ? 'VERIFIED' : 'REJECTED',
        verifiedBy: adminId || 'admin_1',
        verifiedAt: new Date().toISOString(),
        remarks: dto.remarks,
      },
    };
  }

  async getLiveOpsMap() {
    return {
      success: true,
      data: {
        activeCooks: [
          {
            id: 'cook_sita_101',
            name: 'Sita Lakshmi',
            status: 'COOKING',
            currentLocation: { type: 'Point', coordinates: [77.6245, 12.9352] }, // Koramangala
            activeBookingId: 'bk_202611_4819',
          },
          {
            id: 'cook_lakshmi_102',
            name: 'Lakshmamma R.',
            status: 'ONLINE',
            currentLocation: { type: 'Point', coordinates: [77.6408, 12.9784] }, // Indiranagar
          },
          {
            id: 'cook_radha_103',
            name: 'Radha Bai',
            status: 'ONLINE',
            currentLocation: { type: 'Point', coordinates: [77.6446, 12.9121] }, // HSR
          },
        ],
        activeBookings: [
          {
            id: 'bk_202611_4819',
            serviceType: 'LUNCH',
            status: 'IN_PROGRESS',
            coordinates: [77.6245, 12.9352],
            cookName: 'Sita Lakshmi',
            customerName: 'Arjun Rao',
          },
        ],
        pendingSosAlerts: [],
      },
    };
  }

  async getAuditLogs() {
    return {
      success: true,
      data: [
        {
          id: 'audit_01',
          adminName: 'Operations Lead',
          action: 'APPROVED_COOK',
          targetId: 'cook_sita_101',
          timestamp: '2026-11-10T14:30:00.000Z',
        },
      ],
    };
  }
}

