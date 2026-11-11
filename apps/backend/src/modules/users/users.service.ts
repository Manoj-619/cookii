import { Injectable } from '@nestjs/common';
import { UpdateUserDto, CreateAddressDto } from './dto/users.dto';

@Injectable()
export class UsersService {
  async getProfile(userId: string) {
    return {
      success: true,
      data: {
        id: userId || 'user_101',
        phone: '+919876543210',
        name: 'Arjun Rao',
        email: 'arjun.rao@example.com',
        role: 'CUSTOMER',
        createdAt: new Date().toISOString(),
      },
    };
  }

  async updateProfile(userId: string, dto: UpdateUserDto) {
    return {
      success: true,
      data: {
        id: userId || 'user_101',
        phone: '+919876543210',
        name: dto.name || 'Arjun Rao',
        email: dto.email || 'arjun.rao@example.com',
        role: 'CUSTOMER',
      },
    };
  }

  async getAddresses(userId: string) {
    return {
      success: true,
      data: [
        {
          id: 'addr_koramangala',
          label: 'Home',
          fullAddress: '4th Block, Koramangala, Bengaluru, Karnataka 560034',
          landmark: 'Near Sony World Signal',
          pincode: '560034',
          location: { type: 'Point', coordinates: [77.6245, 12.9352] },
          isDefault: true,
        },
        {
          id: 'addr_bellandur',
          label: 'Work / Office',
          fullAddress: 'Ecospace Business Park, Outer Ring Road, Bellandur, Bengaluru 560103',
          landmark: 'Opposite Central Mall',
          pincode: '560103',
          location: { type: 'Point', coordinates: [77.6744, 12.9299] },
          isDefault: false,
        },
      ],
    };
  }

  async createAddress(userId: string, dto: CreateAddressDto) {
    return {
      success: true,
      data: {
        id: `addr_${Date.now()}`,
        userId,
        ...dto,
        location: {
          type: 'Point',
          coordinates: [dto.longitude, dto.latitude],
        },
        createdAt: new Date().toISOString(),
      },
    };
  }
}

