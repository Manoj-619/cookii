import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsArray, IsString, IsOptional, IsNumber, IsBoolean, IsEnum } from 'class-validator';
import { DocumentType } from '@cookii/shared-types';

export class CookOnboardDto {
  @ApiProperty({ example: ['SOUTH_INDIAN', 'KARNATAKA_SPECIAL'], isArray: true })
  @IsNotEmpty()
  @IsArray()
  cuisines!: string[];

  @ApiProperty({ example: ['Kannada', 'Hindi', 'English'], isArray: true })
  @IsNotEmpty()
  @IsArray()
  languages!: string[];

  @ApiProperty({ example: ['Ragi Mudde', 'Bisi Bele Bath', 'Masala Dosa'], required: false })
  @IsOptional()
  @IsArray()
  specialtyDishes?: string[];

  @ApiProperty({ example: 'cooksita@oksbi', required: false })
  @IsOptional()
  @IsString()
  bankUpiId?: string;
}

export class UploadDocumentDto {
  @ApiProperty({ enum: DocumentType, example: DocumentType.AADHAAR })
  @IsNotEmpty()
  @IsEnum(DocumentType)
  documentType!: DocumentType;

  @ApiProperty({ example: 'XXXX-XXXX-1234', required: false })
  @IsOptional()
  @IsString()
  documentNumber?: string;

  @ApiProperty({ example: 'https://res.cloudinary.com/cookii/image/upload/v1/docs/aadhaar.jpg' })
  @IsNotEmpty()
  @IsString()
  fileUrl!: string;
}

export class ToggleAvailabilityDto {
  @ApiProperty({ example: true })
  @IsNotEmpty()
  @IsBoolean()
  isOnline!: boolean;
}

export class UpdateLocationDto {
  @ApiProperty({ example: 77.6245 })
  @IsNotEmpty()
  @IsNumber()
  longitude!: number;

  @ApiProperty({ example: 12.9352 })
  @IsNotEmpty()
  @IsNumber()
  latitude!: number;
}

