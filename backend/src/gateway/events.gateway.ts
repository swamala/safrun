import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { GeoService } from '@/core/redis/geo.service';
import { RedisService } from '@/core/redis/redis.service';
import Redis from 'ioredis';

interface AuthenticatedSocket extends Socket {
  data: {
    user?: {
      id: string;
      deviceId?: string;
    };
  };
}

interface LocationUpdate {
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  sessionId?: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.WS_CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/events',
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);
  private userSockets: Map<string, Set<string>> = new Map();
  private subscriber: Redis;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly geoService: GeoService,
    private readonly redisService: RedisService,
  ) {
    // Create Redis subscriber for pub/sub
    this.initSubscriber();
  }

  private async initSubscriber() {
    const Redis = (await import('ioredis')).default;
    this.subscriber = new Redis({
      host: this.configService.get('REDIS_HOST', 'localhost'),
      port: this.configService.get('REDIS_PORT', 6379),
      password: this.configService.get('REDIS_PASSWORD') || undefined,
    });

    // Subscribe to channels
    this.subscriber.subscribe(
      'sos:notification',
      'sos:verification',
      'sos:update',
      'sos:guardian',
      'sos:group',
      'sos:precise-location',
      'notification:push',
      'session:update',
    );

    this.subscriber.on('message', (channel, message) => {
      this.handleRedisMessage(channel, message);
    });
  }

  private handleRedisMessage(channel: string, message: string) {
    try {
      const data = JSON.parse(message);

      switch (channel) {
        case 'sos:notification':
          this.handleSOSNotification(data);
          break;
        case 'sos:verification':
          this.handleSOSVerification(data);
          break;
        case 'sos:update':
          this.handleSOSUpdate(data);
          break;
        case 'sos:guardian':
          this.handleGuardianAlert(data);
          break;
        case 'sos:group':
          this.handleGroupSOSAlert(data);
          break;
        case 'sos:precise-location':
          this.handlePreciseLocation(data);
          break;
        case 'session:update':
          this.handleSessionUpdate(data);
          break;
      }
    } catch (error) {
      this.logger.error(`Failed to process Redis message: ${(error as Error).message}`);
    }
  }

  afterInit() {
    this.logger.log('WebSocket Gateway initialized');
  }

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = this.extractToken(client);
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET'),
      });

      client.data.user = {
        id: payload.userId,
        deviceId: payload.deviceId,
      };

      // Track user socket
      if (!this.userSockets.has(payload.userId)) {
        this.userSockets.set(payload.userId, new Set());
      }
      this.userSockets.get(payload.userId)?.add(client.id);

      this.logger.log(`Client connected: ${client.id} (user: ${payload.userId})`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    const userId = client.data.user?.id;
    if (userId) {
      this.userSockets.get(userId)?.delete(client.id);
      if (this.userSockets.get(userId)?.size === 0) {
        this.userSockets.delete(userId);
        // Remove from geo index when last socket disconnects
        this.geoService.removeRunner(userId);
      }
    }
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('location:update')
  async handleLocationUpdate(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: LocationUpdate,
  ) {
    const userId = client.data.user?.id;
    if (!userId) return;

    // Update geo index
    await this.geoService.updateRunnerLocation(
      userId,
      data.longitude,
      data.latitude,
      data.sessionId,
    );

    // Broadcast to session if in one
    if (data.sessionId) {
      client.to(`session:${data.sessionId}`).emit('location:broadcast', {
        userId,
        latitude: data.latitude,
        longitude: data.longitude,
        speed: data.speed,
        heading: data.heading,
        timestamp: Date.now(),
      });
    }

    return { status: 'ok' };
  }

  @SubscribeMessage('session:join')
  async handleSessionJoin(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { sessionId: string },
  ) {
    const userId = client.data.user?.id;
    if (!userId) return;

    client.join(`session:${data.sessionId}`);
    client.to(`session:${data.sessionId}`).emit('session:participant-joined', {
      userId,
      timestamp: Date.now(),
    });

    this.logger.log(`User ${userId} joined session room ${data.sessionId}`);
    return { status: 'ok' };
  }

  @SubscribeMessage('session:leave')
  async handleSessionLeave(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { sessionId: string },
  ) {
    const userId = client.data.user?.id;
    if (!userId) return;

    client.to(`session:${data.sessionId}`).emit('session:participant-left', {
      userId,
      timestamp: Date.now(),
    });
    client.leave(`session:${data.sessionId}`);

    // Remove from session geo index
    await this.geoService.removeRunner(userId, data.sessionId);

    this.logger.log(`User ${userId} left session room ${data.sessionId}`);
    return { status: 'ok' };
  }

  @SubscribeMessage('sos:trigger')
  async handleSOSTrigger(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { latitude: number; longitude: number; triggerType: string },
  ) {
    const userId = client.data.user?.id;
    if (!userId) return;

    // Emit to all nearby users (handled via Redis pub/sub)
    this.logger.log(`SOS triggered via WebSocket by ${userId}`);

    return { status: 'ok', message: 'SOS received, processing...' };
  }

  @SubscribeMessage('sos:respond')
  async handleSOSResponse(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { alertId: string; accepted: boolean },
  ) {
    const userId = client.data.user?.id;
    if (!userId) return;

    this.logger.log(`SOS response from ${userId}: ${data.accepted ? 'accepted' : 'declined'}`);

    return { status: 'ok' };
  }

  // Utility methods for sending to specific users
  sendToUser(userId: string, event: string, data: unknown) {
    const socketIds = this.userSockets.get(userId);
    if (socketIds) {
      socketIds.forEach((socketId) => {
        this.server.to(socketId).emit(event, data);
      });
    }
  }

  sendToSession(sessionId: string, event: string, data: unknown) {
    this.server.to(`session:${sessionId}`).emit(event, data);
  }

  // Redis message handlers
  private handleSOSNotification(data: {
    type: string;
    alertId: string;
    responderId: string;
    location: { latitude: number; longitude: number };
    distance: number;
  }) {
    this.sendToUser(data.responderId, 'sos:alert', data);
  }

  private handleSOSVerification(data: {
    type: string;
    userId: string;
    alertId: string;
    message: string;
  }) {
    this.sendToUser(data.userId, 'sos:verify', data);
  }

  private handleSOSUpdate(data: { type: string; userId: string; [key: string]: unknown }) {
    this.sendToUser(data.userId, 'sos:update', data);
  }

  private handleGuardianAlert(data: {
    type: string;
    guardianId: string;
    alertId: string;
    userId: string;
    userName: string;
  }) {
    this.sendToUser(data.guardianId, 'sos:guardian-alert', data);
  }

  private handleGroupSOSAlert(data: {
    type: string;
    userId: string;
    alertId: string;
    sessionId: string;
    triggeredBy: string;
    userName: string;
    location: { latitude: number; longitude: number };
  }) {
    this.sendToUser(data.userId, 'sos:group-alert', data);
  }

  private handlePreciseLocation(data: {
    type: string;
    alertId: string;
    responderId: string;
    location: { latitude: number; longitude: number };
  }) {
    this.sendToUser(data.responderId, 'sos:precise-location', data);
  }

  private handleSessionUpdate(data: { sessionId: string; [key: string]: unknown }) {
    this.sendToSession(data.sessionId, 'session:update', data);
  }

  private extractToken(client: Socket): string | null {
    const auth = client.handshake.auth?.token;
    if (auth) return auth.replace('Bearer ', '');

    const authHeader = client.handshake.headers?.authorization;
    if (authHeader) return authHeader.replace('Bearer ', '');

    const queryToken = client.handshake.query?.token;
    if (typeof queryToken === 'string') return queryToken;

    return null;
  }
}

