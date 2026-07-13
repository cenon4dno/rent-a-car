import { IsString, IsDateString, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty()
  @IsString()
  vehicleId: string;

  @ApiProperty({ example: '123 Main St, Manila' })
  @IsString()
  pickupLocation: string;

  @ApiPropertyOptional({ example: 14.5547, description: 'Pinned pick-up latitude' })
  @IsOptional()
  @IsNumber()
  pickupLat?: number;

  @ApiPropertyOptional({ example: 121.0244, description: 'Pinned pick-up longitude' })
  @IsOptional()
  @IsNumber()
  pickupLng?: number;

  @ApiProperty({ example: '2026-07-01T08:00:00.000Z' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-07-05T08:00:00.000Z' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ description: 'Driver ID if chauffeur service requested' })
  @IsOptional()
  @IsString()
  driverId?: string;

  @ApiPropertyOptional({ description: 'Child seat add-on (₱500/day)' })
  @IsOptional()
  @IsBoolean()
  childSeat?: boolean;

  @ApiPropertyOptional({ description: 'Chauffeur add-on (₱1500/day)' })
  @IsOptional()
  @IsBoolean()
  chauffeur?: boolean;
}
