import type { INotificationPort, NotificationMessage } from '../../domain/shared/notifications.port';
import { logger } from '../logging/logger';

export class ConsoleNotifier implements INotificationPort {
  async send(message: NotificationMessage): Promise<void> {
    logger.info('notification', {
      to: message.to ?? 'n/a',
      subject: message.subject,
      body: message.body,
      ...message.meta,
    });
  }
}
