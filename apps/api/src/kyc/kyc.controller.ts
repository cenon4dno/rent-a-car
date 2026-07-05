import { Controller, Post, Body, Headers, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { KycService } from './kyc.service';
import * as crypto from 'crypto';

@ApiTags('kyc')
@Controller('kyc')
export class KycController {
  constructor(private readonly kycService: KycService) {}

  /**
   * Onfido webhook endpoint.
   * Configure in Onfido dashboard: https://documentation.onfido.com/api#webhooks
   * Webhook secret should be set in ONFIDO_WEBHOOK_TOKEN env var.
   */
  @Post('onfido/webhook')
  @ApiOperation({ summary: 'Receive Onfido KYC decision webhooks' })
  async onfidoWebhook(
    @Body() payload: Record<string, unknown>,
    @Headers('x-sha2-signature') signature: string,
  ) {
    const secret = process.env.ONFIDO_WEBHOOK_TOKEN;
    if (secret && signature) {
      const expected = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(payload))
        .digest('hex');
      if (`sha256=${expected}` !== signature) {
        throw new BadRequestException('Invalid signature');
      }
    }
    await this.kycService.handleWebhook(payload, 'onfido');
    return { received: true };
  }

  /**
   * Veriff webhook endpoint.
   * Configure in Veriff dashboard: https://developers.veriff.com/#webhooks
   * Webhook secret: set VERIFF_SECRET env var.
   */
  @Post('veriff/webhook')
  @ApiOperation({ summary: 'Receive Veriff KYC decision webhooks' })
  async veriffWebhook(
    @Body() payload: Record<string, unknown>,
    @Headers('x-hmac-signature') signature: string,
  ) {
    const secret = process.env.VERIFF_SECRET;
    if (secret && signature) {
      const expected = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(payload))
        .digest('hex');
      if (expected !== signature) {
        throw new BadRequestException('Invalid signature');
      }
    }
    await this.kycService.handleWebhook(payload, 'veriff');
    return { received: true };
  }
}
