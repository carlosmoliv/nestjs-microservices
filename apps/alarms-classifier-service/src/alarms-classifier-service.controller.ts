import { Controller, Get } from '@nestjs/common';
import { AlarmsClassifierServiceService } from './alarms-classifier-service.service';

@Controller()
export class AlarmsClassifierServiceController {
  constructor(private readonly alarmsClassifierServiceService: AlarmsClassifierServiceService) {}

  @Get()
  getHello(): string {
    return this.alarmsClassifierServiceService.getHello();
  }
}
