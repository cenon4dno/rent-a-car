import { IsEmail, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SsoLoginDto {
  @ApiProperty({ example: 'google' })
  @IsString()
  provider: string;

  @ApiProperty()
  @IsString()
  providerAccountId: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  image?: string;
}
