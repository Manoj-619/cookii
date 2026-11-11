import { Injectable, Logger } from '@nestjs/common';
import { CookOnboardDto, UploadDocumentDto, ToggleAvailabilityDto, UpdateLocationDto } from './dto/cooks.dto';
import { CookVerificationStatus } from '@cookii/shared-types';

@Injectable()
export class CooksService {
  private readonly logger = new Logger(CooksService.name);

  async onboard(cookId: string, dto: CookOnboardDto) {
    this.logger.log(`Cook ${cookId} submitted onboarding profile`);
    return {
      success: true,
      data: {
        id: cookId || 'cook_sita_101',
        verificationStatus: CookVerificationStatus.SUBMITTED,
        cuisines: dto.cuisines,
        languages: dto.languages,
        specialtyDishes: dto.specialtyDishes || [],
        bankUpiId: dto.bankUpiId || null,
        updatedAt: new Date().toISOString(),
      },
    };
  }

  async uploadDocument(cookId: string, dto: UploadDocumentDto) {
    this.logger.log(`Cook ${cookId} uploaded ${dto.documentType}`);
    return {
      success: true,
      data: {
        documentId: `doc_${Date.now()}`,
        documentType: dto.documentType,
        status: 'PENDING',
        uploadedAt: new Date().toISOString(),
      },
    };
  }

  async toggleAvailability(cookId: string, dto: ToggleAvailabilityDto) {
    return {
      success: true,
      data: {
        cookId,
        isOnline: dto.isOnline,
        updatedAt: new Date().toISOString(),
      },
    };
  }

  async updateLocation(cookId: string, dto: UpdateLocationDto) {
    return {
      success: true,
      data: {
        cookId,
        currentLocation: {
          type: 'Point',
          coordinates: [dto.longitude, dto.latitude],
        },
        updatedAt: new Date().toISOString(),
      },
    };
  }

  async getEarnings(cookId: string) {
    return {
      success: true,
      data: {
        todayEarnings: 1850.0,
        weekEarnings: 9400.0,
        totalCompletedJobs: 142,
        acceptanceRate: 0.98,
        ratingAverage: 4.92,
        recentPayouts: [
          { id: 'pay_901', amount: 1850.0, date: '2026-11-10', status: 'SETTLED' },
          { id: 'pay_900', amount: 2100.0, date: '2026-11-09', status: 'SETTLED' },
        ],
      },
    };
  }
}

