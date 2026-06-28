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
}
