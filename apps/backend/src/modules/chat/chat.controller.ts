import { Controller, Get, Post, Param, Body, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { SendMessageDto, TriggerSosDto } from './dto/chat.dto';
import { ActorType } from '@cookii/shared-types';

@ApiTags('Chat & Safety')
@ApiBearerAuth()
@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('chat/:bookingId/messages')
  @ApiOperation({ summary: 'Get masked chat history for booking' })
  async getMessages(@Param('bookingId') bookingId: string) {
    return this.chatService.getMessages(bookingId);
  }

  @Post('chat/:bookingId/messages')
  @ApiOperation({ summary: 'Send message in booking' })
  async sendMessage(
    @Param('bookingId') bookingId: string,
    @Headers('user-id') senderId: string,
    @Headers('user-role') role: string = 'CUSTOMER',
    @Body() dto: SendMessageDto,
  ) {
    return this.chatService.sendMessage(bookingId, senderId, role, dto);
  }

  @Post('sos/trigger')
  @ApiOperation({ summary: 'Trigger emergency SOS alert' })
  async triggerSos(
    @Headers('user-id') userId: string,
    @Headers('actor-type') role: ActorType = ActorType.CUSTOMER,
    @Body() dto: TriggerSosDto,
  ) {
    return this.chatService.triggerSos(userId, role, dto);
  }
}

