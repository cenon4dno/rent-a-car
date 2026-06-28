import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({ example: 'paymongo', description: 'Payment provider slug' })
  @IsString()
  provider: string;

  @ApiProperty({ example: 'src_abc123', description: 'Provider-specific payment source/intent ID' })
  @IsString()
  providerRef: string;
}
