import { Controller, Get } from '@nestjs/common';
import { AlarmsServiceService } from './alarms-service.service';

@Controller()
export class AlarmsServiceController {
  constructor(private readonly alarmsServiceService: AlarmsServiceService) {}

  @Get()
  getHello(): string {
    return this.alarmsServiceService.getHello();
  }
}
