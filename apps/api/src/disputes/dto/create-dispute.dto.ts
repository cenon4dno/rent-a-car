import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateDisputeDto {
  @IsString()
  @IsNotEmpty()
  bookingId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  description: string;
}
