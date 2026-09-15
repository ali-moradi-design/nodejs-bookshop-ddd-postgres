import { JwtTokenService } from '../security/token.service';
import { BcryptPasswordHasher } from '../security/password.service';
import { LocalDiskStorage } from '../storage/local-disk.storage';
import { ConsoleNotifier } from '../notifications/console.notifier';
import { PrismaUnitOfWork } from '../persistence/prisma/uow/prisma-unit-of-work';
import { logger } from '../logging/logger';
import { domainEvents } from '../../domain/shared/events';

export const tokenService = new JwtTokenService();
export const passwordHasher = new BcryptPasswordHasher();
export const storage = new LocalDiskStorage();
export const notifier = new ConsoleNotifier();
export const unitOfWork = new PrismaUnitOfWork();
export { logger, domainEvents };

// Wire lightweight domain event stubs to console notifications
domainEvents.on('OrderPaid', async (event) => {
  await notifier.send({
    subject: 'OrderPaid',
    body: JSON.stringify(event.payload),
    meta: { event: event.name },
  });
});

domainEvents.on('StockLow', async (event) => {
  await notifier.send({
    subject: 'StockLow',
    body: JSON.stringify(event.payload),
    meta: { event: event.name },
  });
});
