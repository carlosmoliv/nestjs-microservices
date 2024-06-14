import { Controller, Inject, Logger } from '@nestjs/common';
import { ClientProxy, EventPattern, Payload } from '@nestjs/microservices';
import { NATS_MESSAGE_BROKER, NOTIFICATIONS_SERVICE } from './constants';
import { lastValueFrom } from 'rxjs';

@Controller()
export class AlarmsServiceController {
  private readonly logger = new Logger(AlarmsServiceController.name);

  constructor(
    @Inject(NATS_MESSAGE_BROKER)
    private readonly natsMessageBroker: ClientProxy,
    @Inject(NOTIFICATIONS_SERVICE)
    private readonly notificationsService: ClientProxy,
  ) {}

  @EventPattern('alarm.created')
  async create(@Payload() data: { name: string; buildingId: number }) {
    this.logger.debug(
      `Received new "alarm.created" event: ${JSON.stringify(data)}`,
    );

    // If we decided use choreography pattern instead,we would simply emit an event here and let other services to handle the workflow
    //
    // For example:
    // 1."Alarms service" would emit and event to the "Alarm classifier service" to classify the alarm
    // 2. "Alarm classifier service" would classify the alarm and emit an event to the "Notifications services" to notify other services about the classification.
    // 3. "Notifications service" would subscribe to the "alarm.classified" event and notify other services about the classified alarm.
    const alarmClassification = await lastValueFrom(
      this.natsMessageBroker.send('alarm.classify', data),
    );
    this.logger.debug(
      `Alarm "${data.name}" classified as ${alarmClassification.category}`,
    );

    const notify$ = this.notificationsService.emit('notification.send', {
      alarm: data,
      category: alarmClassification.category,
    });
    await lastValueFrom(notify$);
    this.logger.debug(`Dispatched "notification.send" event`);
  }
}
