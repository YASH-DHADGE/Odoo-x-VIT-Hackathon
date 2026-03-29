import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type NotificationType =
  | 'expense.submitted'
  | 'expense.approved'
  | 'expense.rejected'
  | 'user.created';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Log a notification event. In production this would push via WebSocket
   * (add @nestjs/websockets + socket.io) or push to a notification table.
   */
  notify(type: NotificationType, payload: Record<string, unknown>): void {
    this.logger.log(`[NOTIFY] ${type}: ${JSON.stringify(payload)}`);
    // TODO: emit via WebSocket gateway once socket.io is installed:
    // this.gateway.server.to(payload.userId).emit(type, payload);
  }
}
