import { Inject, Logger } from '@nestjs/common';
import { OutboxService } from './outbox.service';
import { WORKFLOWS_SERVICE } from '../constants';
import { ClientProxy, RmqRecord } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Outbox } from './entities/outbox.entity';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { lastValueFrom } from 'rxjs';

export class OutboxProcessor {
  private readonly logger = new Logger(OutboxProcessor.name);

  constructor(
    private readonly outboxService: OutboxService,
    @Inject(WORKFLOWS_SERVICE)
    private readonly workflowsService: ClientProxy,
    @InjectRepository(Outbox)
    private readonly outboxRepository: Repository<Outbox>,
  ) {}

  /**
   * This method will be executed every 10 seconds.
   * Production-ready applications should use more reasonable interval.
   * Also, in the real-world system, we would rather use "@nestjs/bull" instead of "@nestjs/bull" instead of "@nestjs/schedule"
   * because it provided more sophisticated features (e.g. locking, supports multiple nodes running in parallel)
   * */
  @Cron(CronExpression.EVERY_10_SECONDS)
  async processOutboxMessages() {
    this.logger.debug(`Processing outbox messages`);

    const messages = await this.outboxService.getUnprocessedMessages({
      target: WORKFLOWS_SERVICE.description,
      take: 100,
    });
    await Promise.all(
      messages.map(async (message) => {
        await this.dispatchWorkflowEvent(message);
        // Instead of removing the message from the database, we could also update the message status "processing"
        await this.outboxRepository.delete(message.id);
      }),
    );
  }

  private async dispatchWorkflowEvent(outbox: Outbox) {
    const rmqRecord = new RmqRecord(outbox.payload, {
      messageId: `${outbox.id}`,
    });
    await lastValueFrom(this.workflowsService.emit(outbox.type, rmqRecord));
  }
}
