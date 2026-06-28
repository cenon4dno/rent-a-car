import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface KbEntry {
  question: string;
  answer: string;
  keywords: string;
  category: string;
}

interface UserContext {
  name?: string;
  activeBooking?: string;
  kycStatus?: string;
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(private readonly prisma: PrismaService) {}

  async chat(message: string, userId?: string): Promise<string> {
    const [kbEntries, userCtx] = await Promise.all([
      this.prisma.knowledgeBase.findMany(),
      userId ? this.getUserContext(userId) : Promise.resolve({}),
    ]);

    const relevant = this.retrieveRelevant(message, kbEntries, 4);
    const context = this.buildContext(relevant, userCtx);

    return this.callClaude(message, context);
  }

  private retrieveRelevant(query: string, entries: KbEntry[], topK: number): KbEntry[] {
    const queryWords = this.tokenize(query);

    const scored = entries.map((entry) => {
      const searchText = `${entry.question} ${entry.answer} ${entry.keywords}`.toLowerCase();
      const entryWords = this.tokenize(searchText);
      const matches = queryWords.filter((w) => entryWords.includes(w)).length;
      const score = queryWords.length > 0 ? matches / queryWords.length : 0;
      return { entry, score };
    });

    return scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map((s) => s.entry);
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2);
  }

  private buildContext(entries: KbEntry[], userCtx: UserContext): string {
    const kbSection =
      entries.length > 0
        ? entries.map((e) => `Q: ${e.question}\nA: ${e.answer}`).join('\n\n')
        : 'No specific policy information found for this query.';

    const userSection = userCtx.name
      ? `\nUser context:\n- Name: ${userCtx.name}\n- KYC Status: ${userCtx.kycStatus ?? 'Unknown'}${userCtx.activeBooking ? `\n- Active booking: ${userCtx.activeBooking}` : ''}`
      : '';

    return `${kbSection}${userSection}`;
  }

  private async getUserContext(userId: string): Promise<UserContext> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { customerProfile: true },
      });

      if (!user) return {};

      const activeBooking = await this.prisma.booking.findFirst({
        where: {
          customerId: user.customerProfile?.id,
          status: { in: ['CONFIRMED', 'ACTIVE'] },
        },
        include: { vehicle: true },
        orderBy: { createdAt: 'desc' },
      });

      return {
        name: user.name,
        kycStatus: user.kycStatus,
        activeBooking: activeBooking
          ? `${activeBooking.vehicle.make} ${activeBooking.vehicle.model} (${activeBooking.status}, ref: RAC-${activeBooking.id.toUpperCase().slice(0, 8)})`
          : undefined,
      };
    } catch {
      return {};
    }
  }

  private async callClaude(userMessage: string, context: string): Promise<string> {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return this.fallbackReply(context, userMessage);
    }

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 512,
          system: `You are a helpful assistant for RentACar, a car rental marketplace platform in the Philippines. Answer questions based on the provided knowledge base context. Be concise, friendly, and accurate. If the answer is not in the context, say so honestly and suggest the user contact support.

Knowledge Base Context:
${context}`,
          messages: [{ role: 'user', content: userMessage }],
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        this.logger.error(`Claude API error: ${res.status} ${err}`);
        return this.fallbackReply(context, userMessage);
      }

      const data = (await res.json()) as {
        content: Array<{ type: string; text: string }>;
      };
      return data.content.find((c) => c.type === 'text')?.text ?? 'I could not generate a reply.';
    } catch (err) {
      this.logger.error('Claude API call failed', err);
      return this.fallbackReply(context, userMessage);
    }
  }

  private fallbackReply(context: string, _userMessage: string): string {
    if (!context || context.startsWith('No specific')) {
      return "I'm sorry, I couldn't find information about that. Please contact our support team for assistance.";
    }
    const firstAnswer = context.match(/A: (.+?)(?:\n\n|$)/s)?.[1];
    return firstAnswer
      ? firstAnswer.trim()
      : "I'm here to help! Please contact our support team for detailed assistance.";
  }
}
