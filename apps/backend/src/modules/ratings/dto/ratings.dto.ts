import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, Min, Max, IsArray, IsOptional } from 'class-validator';

export class SubmitRatingDto {
  @ApiProperty({ example: 'bk_202611_4819' })
  @IsNotEmpty()
  @IsString()
  bookingId!: string;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiProperty({ example: ['Punctual', 'Delicious', 'Cleaned Kitchen'], isArray: true, required: false })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiProperty({ example: 'Sita cooked wonderful soft dosas and tomato chutney!', required: false })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiProperty({ example: 50, required: false })
  @IsOptional()
  @IsNumber()
  tipAmount?: number;
}

