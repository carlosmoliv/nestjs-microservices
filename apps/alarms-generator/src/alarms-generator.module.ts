import { Module } from '@nestjs/common';
import { AlarmsGeneratorController } from './alarms-generator.controller';
import { AlarmsGeneratorService } from './alarms-generator.service';

@Module({
  imports: [],
  controllers: [AlarmsGeneratorController],
  providers: [AlarmsGeneratorService],
})
export class AlarmsGeneratorModule {}
