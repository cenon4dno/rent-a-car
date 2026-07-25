import { Controller, Get, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { MessagesService } from './messages.service';
import { OpenConversationDto } from './dto/open-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';

interface AuthedRequest {
  user: { id: string; role: string };
}

@ApiTags('messages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('conversations')
  async listConversations(@Query('all') all: string, @Req() req: AuthedRequest) {
    return {
      data: await this.messagesService.listConversations(
        req.user.id,
        req.user.role,
        all === 'true',
      ),
    };
  }

  @Post('conversations')
  async openConversation(@Body() dto: OpenConversationDto, @Req() req: AuthedRequest) {
    return { data: await this.messagesService.openConversation(req.user.id, dto) };
  }

  @Get('conversations/:id')
  async getConversation(@Param('id') id: string, @Req() req: AuthedRequest) {
    return { data: await this.messagesService.getConversation(id, req.user.id, req.user.role) };
  }

  @Post('conversations/:id/messages')
  async sendMessage(
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
    @Req() req: AuthedRequest,
  ) {
    return {
      data: await this.messagesService.sendMessage(id, req.user.id, req.user.role, dto.body),
    };
  }

  @Get('unread-count')
  async unreadCount(@Req() req: AuthedRequest) {
    return { data: await this.messagesService.unreadCount(req.user.id) };
  }
}
