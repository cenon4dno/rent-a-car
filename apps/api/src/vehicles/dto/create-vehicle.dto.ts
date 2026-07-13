import { IsString, IsInt, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FuelType, TransmissionType } from '@prisma/client';

export class CreateVehicleDto {
  @ApiProperty({ example: 'Toyota' })
  @IsString()
  make: string;

  @ApiProperty({ example: 'Vios' })
  @IsString()
  model: string;

  @ApiProperty({ example: 2023 })
  @IsInt()
  year: number;

  @ApiProperty({ example: 'ABC 1234' })
  @IsString()
  plateNumber: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: FuelType })
  @IsEnum(FuelType)
  fuelType: FuelType;

  @ApiProperty({ enum: TransmissionType })
  @IsEnum(TransmissionType)
  transmission: TransmissionType;

  @ApiProperty({ example: 5 })
  @IsInt()
  @Min(1)
  seatingCapacity: number;

  @ApiProperty({ example: 2500 })
  @IsNumber()
  @Min(0)
  dailyRate: number;

  @ApiPropertyOptional({ example: 300 })
  @IsOptional()
  @IsInt()
  mileageLimit?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  imageUrls?: string[];

  @ApiPropertyOptional({
    description: 'Vehicle photos: front, back, side, interior (base64 data URLs)',
  })
  @IsOptional()
  vehiclePhotos?: {
    front?: string;
    back?: string;
    side?: string;
    interior?: string;
  };

  @ApiPropertyOptional({ description: 'Registration docs: or, cr (base64 data URLs or PDF)' })
  @IsOptional()
  registrationDocs?: {
    or?: string;
    cr?: string;
  };

  @ApiPropertyOptional({
    type: [String],
    description: 'Use-case tags e.g. Wedding, Airport Transfer, Road Trip',
    example: ['Wedding', 'Airport Transfer'],
  })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({
    description: 'City or area where the vehicle operates',
    example: 'Makati, Metro Manila, Philippines',
  })
  @IsOptional()
  @IsString()
  operatingLocation?: string;

  @ApiPropertyOptional({ example: 14.5547 })
  @IsOptional()
  @IsNumber()
  operatingLat?: number;

  @ApiPropertyOptional({ example: 121.0244 })
  @IsOptional()
  @IsNumber()
  operatingLng?: number;
}
