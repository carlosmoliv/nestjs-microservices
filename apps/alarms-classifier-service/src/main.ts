import { NestFactory } from '@nestjs/core';
import { AlarmsClassifierServiceModule } from './alarms-classifier-service.module';

async function bootstrap() {
  const app = await NestFactory.create(AlarmsClassifierServiceModule);
  await app.listen(3000);
}
bootstrap();
