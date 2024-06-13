import { Inject, Injectable } from '@nestjs/common';
import { ALARMS_SERVICE } from './constants';
import { ClientProxy } from '@nestjs/microservices';
import { Interval } from '@nestjs/schedule';

@Injectable()
export class AlarmsGeneratorService {
  constructor(
    @Inject(ALARMS_SERVICE)
    private readonly alarmsService: ClientProxy,
  ) {}

  @Interval(100000)
  getHello() {
    const alarmCreatedEvent = {
      name: 'Alarm #' + Math.floor(Math.random() * 1000) + 1,
      buildingId: Math.floor(Math.random() * 100) + 1,
    };
    this.alarmsService.emit('alarms.created', alarmCreatedEvent);
  }
}
