import { Controller, Inject, Logger } from '@nestjs/common';
import { ClientProxy, EventPattern, Payload } from '@nestjs/microservices';
import { MESSAGE_BROKER } from './constants';
import { lastValueFrom } from 'rxjs';

@Controller()
export class AlarmsServiceController {
  private readonly logger = new Logger(AlarmsServiceController.name);

  constructor(
    @Inject(MESSAGE_BROKER) private readonly messageBroker: ClientProxy,
  ) {}

  @EventPattern('alarm.created')
  async create(@Payload() data: { name: string; buildingId: number }) {
    this.logger.debug(
      `Received new "alarm.created" event: ${JSON.stringify(data)}`,
    );

    const alarmClassification = await lastValueFrom(
      this.messageBroker.send('alarm.classify', data),
    );
    this.logger.debug(
      `Alarm "${data.name}" classified as ${alarmClassification.category}`,
    );

    const notify$ = this.messageBroker.emit('notification.send', {
      alarm: data,
      category: alarmClassification.category,
    });
    await lastValueFrom(notify$);
    this.logger.debug(`Dispatched "notification.send" event`);
  }
}
