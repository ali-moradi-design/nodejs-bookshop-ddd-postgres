export interface NotificationMessage {
  to?: string;
  subject: string;
  body: string;
  meta?: Record<string, unknown>;
}

export interface INotificationPort {
  send(message: NotificationMessage): Promise<void>;
}
