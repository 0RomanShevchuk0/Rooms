import { Module } from '@nestjs/common';
import { EventsWsGateway } from './events-ws.gateway';

@Module({
	providers: [EventsWsGateway],
})
export class WsModule {}
