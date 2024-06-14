import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';

@Controller()
export class NotificationsServiceController {
  private readonly logger = new Logger(NotificationsServiceController.name);

  @EventPattern('notification.send')
  sendNotification(@Payload() data: unknown, @Ctx() context: RmqContext) {
    // In the real-world scenario, this service would be responsible for notifying other services (or user)
    // For example, it could email the building manager/department about the alarm
    // It could also send an SMS message to the maintenance team

    this.logger.debug(
      `Sending notification about the alarm: ${JSON.stringify(data)}`,
    );
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    if (originalMsg.fields.redelivered) {
      this.logger.verbose(
        `Message was already redelivered. Acknowledging the message and discarding it.`,
      );
      return channel.ack(originalMsg);
    }

    channel.nack(originalMsg);
  }
}
