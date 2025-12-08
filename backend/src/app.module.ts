import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bullmq';

// Core modules
import { PrismaModule } from './core/prisma/prisma.module';
import { RedisModule } from './core/redis/redis.module';

// Feature modules
import { AuthModule } from './modules/auth/auth.module';
import { ProfileModule } from './modules/profile/profile.module';
import { SessionModule } from './modules/session/session.module';
import { LocationModule } from './modules/location/location.module';
import { SosModule } from './modules/sos/sos.module';
import { NearbyModule } from './modules/nearby/nearby.module';
import { NotificationModule } from './modules/notification/notification.module';
import { FeedModule } from './modules/feed/feed.module';

// WebSocket gateway
import { EventsModule } from './gateway/events.module';

// Shared modules
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),

    // Background jobs scheduler
    ScheduleModule.forRoot(),

    // BullMQ for background jobs
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD || undefined,
      },
    }),

    // Core modules
    PrismaModule,
    RedisModule,

    // Feature modules
    AuthModule,
    ProfileModule,
    SessionModule,
    LocationModule,
    SosModule,
    NearbyModule,
    NotificationModule,
    FeedModule,

    // WebSocket gateway
    EventsModule,

    // Shared modules
    SharedModule,
  ],
})
export class AppModule {}

