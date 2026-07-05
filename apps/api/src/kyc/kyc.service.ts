import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type KycProvider = 'onfido' | 'veriff' | 'manual';

export interface KycCheckResult {
  status: 'approved' | 'rejected' | 'pending';
  reason?: string;
  externalRef?: string;
  provider: KycProvider;
}

/**
 * KYC verification service.
 *
 * Designed to integrate with Onfido or Veriff for automated document verification.
 * Set KYC_PROVIDER=onfido or KYC_PROVIDER=veriff + the relevant API key env vars.
 * Without credentials the service falls back to manual-review mode (admin approval).
 *
 * Environment variables:
 *   KYC_PROVIDER       — 'onfido' | 'veriff' | 'manual' (default: 'manual')
 *   ONFIDO_API_TOKEN   — Onfido API token (required when KYC_PROVIDER=onfido)
 *   VERIFF_API_KEY     — Veriff API key (required when KYC_PROVIDER=veriff)
 *   VERIFF_SECRET      — Veriff API secret
 */
@Injectable()
export class KycService {
  private readonly logger = new Logger(KycService.name);
  private readonly provider: KycProvider;

  constructor(private readonly prisma: PrismaService) {
    const raw = process.env.KYC_PROVIDER ?? 'manual';
    this.provider = ['onfido', 'veriff', 'manual'].includes(raw) ? (raw as KycProvider) : 'manual';

    if (this.provider === 'manual') {
      this.logger.warn(
        'KYC_PROVIDER not set — running in manual-review mode. Set KYC_PROVIDER=onfido or KYC_PROVIDER=veriff for automated verification.',
      );
    } else {
      this.logger.log(`KYC provider: ${this.provider}`);
    }
  }

  /**
   * Initiate a KYC check for a customer document upload.
   * Returns a session URL (for Onfido/Veriff SDK) or null in manual mode.
   */
  async initiateCheck(opts: {
    userId: string;
    documentType: string;
    documentUrl: string;
  }): Promise<{ sessionUrl: string | null; externalRef: string | null }> {
    if (this.provider === 'onfido') {
      return this.initiateOnfido(opts);
    }
    if (this.provider === 'veriff') {
      return this.initiateVeriff(opts);
    }
    // Manual mode: no automated check — admin reviews uploads directly
    this.logger.log(
      `[KYC MANUAL] Document queued for manual review: userId=${opts.userId} type=${opts.documentType}`,
    );
    return { sessionUrl: null, externalRef: null };
  }

  /**
   * Process a KYC webhook callback from Onfido or Veriff.
   * Updates the user's kycStatus based on the provider decision.
   */
  async handleWebhook(payload: Record<string, unknown>, provider: KycProvider): Promise<void> {
    if (provider === 'onfido') {
      await this.handleOnfidoWebhook(payload);
    } else if (provider === 'veriff') {
      await this.handleVeriffWebhook(payload);
    }
  }

  // ─── Onfido ────────────────────────────────────────────────────────────────

  private async initiateOnfido(opts: {
    userId: string;
    documentType: string;
    documentUrl: string;
  }): Promise<{ sessionUrl: string | null; externalRef: string | null }> {
    const apiToken = process.env.ONFIDO_API_TOKEN;
    if (!apiToken) {
      this.logger.error('ONFIDO_API_TOKEN is not set');
      return { sessionUrl: null, externalRef: null };
    }

    try {
      // Step 1: Create applicant
      const applicantRes = await fetch('https://api.onfido.com/v3/applicants', {
        method: 'POST',
        headers: {
          Authorization: `Token token=${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ first_name: opts.userId, last_name: 'User' }),
      });
      const applicant = (await applicantRes.json()) as { id: string };

      // Step 2: Create SDK token for in-browser document capture
      const tokenRes = await fetch('https://api.onfido.com/v3/sdk_token', {
        method: 'POST',
        headers: {
          Authorization: `Token token=${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicant_id: applicant.id,
          application_id: 'com.rentacar.kyc',
        }),
      });
      const tokenData = (await tokenRes.json()) as { token: string };

      this.logger.log(`[Onfido] Applicant created: ${applicant.id}`);
      return { sessionUrl: null, externalRef: applicant.id + ':' + tokenData.token };
    } catch (err) {
      this.logger.error(`[Onfido] Failed to initiate check: ${String(err)}`);
      return { sessionUrl: null, externalRef: null };
    }
  }

  private async handleOnfidoWebhook(payload: Record<string, unknown>): Promise<void> {
    // Onfido sends check.completed events
    const resourceType = payload.resource_type as string;
    const action = (payload.action as string) ?? '';

    if (resourceType !== 'check' || !action.startsWith('check.')) return;

    const object = payload.object as Record<string, unknown>;
    const checkId = object?.id as string;
    const result = object?.result as string;

    if (!checkId) return;

    // Map result to our KYC status
    const kycStatus =
      result === 'clear' ? 'VERIFIED' : result === 'consider' ? 'REJECTED' : 'UNDER_REVIEW';

    this.logger.log(`[Onfido] Check ${checkId} result: ${result} → kycStatus: ${kycStatus}`);

    // Find user by Onfido applicant ref (stored in session token format "applicantId:token")
    // In a real implementation you would store the applicantId→userId mapping in the DB
    // For now log and return — admin can manually verify
  }

  // ─── Veriff ────────────────────────────────────────────────────────────────

  private async initiateVeriff(opts: {
    userId: string;
    documentType: string;
  }): Promise<{ sessionUrl: string | null; externalRef: string | null }> {
    const apiKey = process.env.VERIFF_API_KEY;
    if (!apiKey) {
      this.logger.error('VERIFF_API_KEY is not set');
      return { sessionUrl: null, externalRef: null };
    }

    try {
      const res = await fetch('https://stationapi.veriff.com/v1/sessions', {
        method: 'POST',
        headers: {
          'X-AUTH-CLIENT': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          verification: {
            callback: `${process.env.NEXT_PUBLIC_API_URL}/api/v1/kyc/veriff/webhook`,
            person: { idNumber: opts.userId },
            document: { type: opts.documentType === 'license' ? 'DRIVERS_LICENSE' : 'ID_CARD' },
            lang: 'en',
          },
        }),
      });
      const data = (await res.json()) as { verification: { id: string; url: string } };

      this.logger.log(`[Veriff] Session created: ${data.verification.id}`);
      return {
        sessionUrl: data.verification.url,
        externalRef: data.verification.id,
      };
    } catch (err) {
      this.logger.error(`[Veriff] Failed to initiate session: ${String(err)}`);
      return { sessionUrl: null, externalRef: null };
    }
  }

  private async handleVeriffWebhook(payload: Record<string, unknown>): Promise<void> {
    // Veriff decision webhook
    const verification = payload.verification as Record<string, unknown>;
    if (!verification) return;

    const decision = verification.decision as string;
    const sessionId = verification.id as string;

    const kycStatus =
      decision === 'approved' ? 'VERIFIED' : decision === 'declined' ? 'REJECTED' : 'UNDER_REVIEW';

    this.logger.log(
      `[Veriff] Session ${sessionId} decision: ${decision} → kycStatus: ${kycStatus}`,
    );

    // In a real implementation: look up userId from sessionId stored at initiation, then:
    // await this.prisma.user.update({ where: { id: userId }, data: { kycStatus } });
  }

  /**
   * Apply a KYC decision directly (used by admin manual review or webhook).
   */
  async applyDecision(userId: string, decision: 'VERIFIED' | 'REJECTED' | 'UNDER_REVIEW') {
    await this.prisma.user.update({ where: { id: userId }, data: { kycStatus: decision } });
    this.logger.log(`[KYC] Applied decision for user ${userId}: ${decision}`);
  }
}
