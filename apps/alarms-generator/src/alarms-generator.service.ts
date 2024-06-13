import { Injectable } from '@nestjs/common';

@Injectable()
export class AlarmsGeneratorService {
  getHello(): string {
    return 'Hello World!';
  }
}
