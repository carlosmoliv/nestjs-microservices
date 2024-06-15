import { Module } from '@nestjs/common';
import { NatsClientProxy } from '@app/tracing/nats-client/nats-client.proxy';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { NATS_BROKER } from '@app/tracing/nats-client/constants';
import * as process from 'node:process';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: NATS_BROKER,
        transport: Transport.NATS,
        options: {
          servers: process.env.NATS_URL,
        },
      },
    ]),
  ],
  providers: [NatsClientProxy],
  exports: [NatsClientProxy],
})
export class NatsClientModule {}
