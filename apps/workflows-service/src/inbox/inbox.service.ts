import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { Inbox } from './entitie/inbox.entity';

@Injectable()
export class InboxService {
  constructor(private readonly dataSource: DataSource) {}

  async processInboxMessages(
    process: (message: Inbox[], manager: EntityManager) => Promise<unknown>,
    options: { take: number },
  ) {
    return this.dataSource.transaction(async (manager) => {
      const inboxRepository = manager.getRepository(Inbox);
      const message = await inboxRepository.find({
        where: { status: 'pending' },
        order: { createdAt: 'ASC' },
        take: options.take,
        // While this approach, it's far from ideal as we'll have 2 nodes running cron jobs that basically
        // compete for the same resources, potentially causing contention and performance issues
        lock: {
          mode: 'pessimistic_write',
          onLocked: 'nowait',
        },
      });
      await process(message, manager);
    });
  }
}
