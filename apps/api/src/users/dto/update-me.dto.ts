import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateMeDto {
  @ApiPropertyOptional({ example: 'Juan dela Cruz' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name?: string;

  @ApiPropertyOptional({ example: '+63 917 123 4567' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  // Renter-only fields — ignored for other roles
  @ApiPropertyOptional({ example: 'Metro Wheels Inc.' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  companyName?: string;

  @ApiPropertyOptional({ example: '123-456-789-000' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  taxIdNumber?: string;

  @ApiPropertyOptional({ example: 'BPI 1234-5678-90 Metro Wheels Inc.' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  bankAccountDetails?: string;
}
