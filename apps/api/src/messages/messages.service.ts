import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MessagesGateway } from './messages.gateway';
import { OpenConversationDto } from './dto/open-conversation.dto';

const PARTICIPANT_USER_SELECT = {
  id: true,
  name: true,
  role: true,
  avatarUrl: true,
} as const;

@Injectable()
export class MessagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: MessagesGateway,
  ) {}

  /** Conversations the user participates in — or every conversation for admins (`all`). */
  async listConversations(userId: string, role: string, all = false) {
    const conversations = await this.prisma.conversation.findMany({
      where: all && role === 'ADMIN' ? {} : { participants: { some: { userId } } },
      include: {
        participants: { include: { user: { select: PARTICIPANT_USER_SELECT } } },
        booking: {
          select: {
            id: true,
            vehicle: { select: { make: true, model: true, year: true } },
          },
        },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { updatedAt: 'desc' },
      take: 100,
    });

    return Promise.all(
      conversations.map(async (c) => {
        const me = c.participants.find((p) => p.userId === userId);
        const unreadCount = me
          ? await this.prisma.message.count({
              where: {
                conversationId: c.id,
                senderId: { not: userId },
                ...(me.lastReadAt ? { createdAt: { gt: me.lastReadAt } } : {}),
              },
            })
          : 0;
        return { ...c, lastMessage: c.messages[0] ?? null, messages: undefined, unreadCount };
      }),
    );
  }

  /** Find or create the 1:1 conversation with `recipientId` (optionally booking-scoped). */
  async openConversation(userId: string, dto: OpenConversationDto) {
    if (dto.recipientId === userId) {
      throw new ForbiddenException('Cannot start a conversation with yourself');
    }
    const recipient = await this.prisma.user.findUnique({ where: { id: dto.recipientId } });
    if (!recipient) throw new NotFoundException('Recipient not found');

    const existing = await this.prisma.conversation.findFirst({
      where: {
        bookingId: dto.bookingId ?? null,
        AND: [
          { participants: { some: { userId } } },
          { participants: { some: { userId: dto.recipientId } } },
        ],
      },
    });
    if (existing) return existing;

    return this.prisma.conversation.create({
      data: {
        bookingId: dto.bookingId ?? null,
        participants: { create: [{ userId }, { userId: dto.recipientId }] },
      },
    });
  }

  /** Conversation with messages; marks it read for the requesting participant. */
  async getConversation(id: string, userId: string, role: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id },
      include: {
        participants: { include: { user: { select: PARTICIPANT_USER_SELECT } } },
        booking: {
          select: {
            id: true,
            vehicle: { select: { make: true, model: true, year: true } },
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 200,
          include: { sender: { select: PARTICIPANT_USER_SELECT } },
        },
      },
    });
    if (!conversation) throw new NotFoundException('Conversation not found');

    const me = conversation.participants.find((p) => p.userId === userId);
    if (!me && role !== 'ADMIN') throw new ForbiddenException();

    if (me) {
      await this.prisma.conversationParticipant.update({
        where: { id: me.id },
        data: { lastReadAt: new Date() },
      });
    }
    return conversation;
  }

  async sendMessage(conversationId: string, userId: string, role: string, body: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { participants: true },
    });
    if (!conversation) throw new NotFoundException('Conversation not found');

    let me = conversation.participants.find((p) => p.userId === userId);
    if (!me) {
      if (role !== 'ADMIN') throw new ForbiddenException();
      // Admins join threads they mediate
      me = await this.prisma.conversationParticipant.create({
        data: { conversationId, userId },
      });
      conversation.participants.push(me);
    }

    const message = await this.prisma.message.create({
      data: { conversationId, senderId: userId, body },
      include: { sender: { select: PARTICIPANT_USER_SELECT } },
    });

    await this.prisma.$transaction([
      this.prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      }),
      this.prisma.conversationParticipant.update({
        where: { id: me.id },
        data: { lastReadAt: new Date() },
      }),
    ]);

    for (const p of conversation.participants) {
      if (p.userId !== userId) {
        this.gateway.emitToUser(p.userId, 'message:new', { conversationId, message });
      }
    }
    return message;
  }

  /** Total unread messages across all of the user's conversations (Navbar badge). */
  async unreadCount(userId: string) {
    const participants = await this.prisma.conversationParticipant.findMany({
      where: { userId },
      select: { conversationId: true, lastReadAt: true },
    });
    const counts = await Promise.all(
      participants.map((p) =>
        this.prisma.message.count({
          where: {
            conversationId: p.conversationId,
            senderId: { not: userId },
            ...(p.lastReadAt ? { createdAt: { gt: p.lastReadAt } } : {}),
          },
        }),
      ),
    );
    return { count: counts.reduce((sum, n) => sum + n, 0) };
  }
}
