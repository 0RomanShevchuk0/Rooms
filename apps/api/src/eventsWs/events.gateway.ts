import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';

@WebSocketGateway({
  namespace: 'events',
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class EventsGateway {
  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    console.log('WS Client connected', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('WS Client disconnected', client.id);
  }

  @SubscribeMessage('room:join')
  async joinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { roomId: string },
  ) {
    await client.join(body.roomId);
    return { ok: true };
  }

  @SubscribeMessage('room:leave')
  async leaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { roomId: string },
  ) {
    await client.leave(body.roomId);
    return { ok: true };
  }
}
