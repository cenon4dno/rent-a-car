import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OpenConversationDto {
  @ApiProperty({ description: 'User ID of the other participant' })
  @IsString()
  recipientId: string;

  @ApiPropertyOptional({ description: 'Booking ID to scope the thread to' })
  @IsOptional()
  @IsString()
  bookingId?: string;
}
