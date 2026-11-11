import { Injectable, Logger } from '@nestjs/common';
import { SendMessageDto, TriggerSosDto } from './dto/chat.dto';
import { SosAlertStatus, ActorType } from '@cookii/shared-types';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  async getMessages(bookingId: string) {
    return {
      success: true,
      data: [
        {
          id: 'msg_1',
          bookingId,
          senderRole: 'CUSTOMER',
          senderName: 'Arjun',
          text: 'Hi Sita, please let me know when you reach the gate.',
          createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
        },
        {
          id: 'msg_2',
          bookingId,
          senderRole: 'COOK',
          senderName: 'Sita Lakshmi',
          text: 'Namaskara! Just reached the security gate. Coming up to 402.',
          createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
        },
      ],
    };
  }

  async sendMessage(bookingId: string, senderId: string, role: string, dto: SendMessageDto) {
    this.logger.log(`New masked message in booking ${bookingId} from ${role}`);
    return {
      success: true,
      data: {
        id: `msg_${Date.now()}`,
        bookingId,
        senderId,
        senderRole: role,
        text: dto.text,
        createdAt: new Date().toISOString(),
      },
    };
  }

  async triggerSos(userId: string, role: ActorType, dto: TriggerSosDto) {
    this.logger.error(`EMERGENCY SOS TRIGGERED for booking ${dto.bookingId} by ${role} (${userId}) at [${dto.longitude}, ${dto.latitude}]`);
    return {
      success: true,
      data: {
        alertId: `sos_${Date.now()}`,
        bookingId: dto.bookingId,
        triggeredBy: userId,
        status: SosAlertStatus.TRIGGERED,
        message: 'Emergency protocol initiated. Ops response dispatched and emergency contact notified.',
        createdAt: new Date().toISOString(),
      },
    };
  }
}

