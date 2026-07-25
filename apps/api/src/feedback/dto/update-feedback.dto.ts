import { IsString, IsOptional, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateFeedbackDto {
  @ApiPropertyOptional({ enum: ['NEW', 'IN_REVIEW', 'RESOLVED'] })
  @IsOptional()
  @IsIn(['NEW', 'IN_REVIEW', 'RESOLVED'])
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  adminReply?: string | null;
}
