import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({ example: 'Hi Sita, please ring bell 402 upon reaching.' })
  @IsNotEmpty()
  @IsString()
  text!: string;
}

export class TriggerSosDto {
  @ApiProperty({ example: 'bk_202611_4819' })
  @IsNotEmpty()
  @IsString()
  bookingId!: string;

  @ApiProperty({ example: 77.6245 })
  @IsNotEmpty()
  @IsNumber()
  longitude!: number;

  @ApiProperty({ example: 12.9352 })
  @IsNotEmpty()
  @IsNumber()
  latitude!: number;
}

