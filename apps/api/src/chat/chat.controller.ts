import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ChatService } from './chat.service';
import { ChatDto } from './dto/chat.dto';

@ApiTags('chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async chat(@Body() dto: ChatDto) {
    const reply = await this.chatService.chat(dto.message);
    return { data: { reply } };
  }

  @Post('auth')
  @UseGuards(JwtAuthGuard)
  async chatAuthenticated(@Body() dto: ChatDto, @Req() req: { user: { userId: string } }) {
    const reply = await this.chatService.chat(dto.message, req.user.userId);
    return { data: { reply } };
  }
}
