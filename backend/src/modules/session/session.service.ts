import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@/core/prisma/prisma.service';
import { GeoService } from '@/core/redis/geo.service';
import { RedisService } from '@/core/redis/redis.service';
import { ParticipantService } from './services/participant.service';
import {
  CreateSessionDto,
  UpdateSessionDto,
  SessionResponseDto,
  SessionListDto,
  SessionFiltersDto,
} from './dto/session.dto';
import { RunSessionStatus, ParticipantRole, ParticipantStatus } from '@prisma/client';

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly geoService: GeoService,
    private readonly redisService: RedisService,
    private readonly participantService: ParticipantService,
  ) {}

  async createSession(userId: string, dto: CreateSessionDto): Promise<SessionResponseDto> {
    const session = await this.prisma.runSession.create({
      data: {
        creatorId: userId,
        name: dto.name,
        description: dto.description,
        scheduledStartAt: dto.scheduledStartAt,
        status: dto.scheduledStartAt ? RunSessionStatus.SCHEDULED : RunSessionStatus.ACTIVE,
        privacy: dto.privacy,
        startLatitude: dto.startLatitude,
        startLongitude: dto.startLongitude,
        plannedDistance: dto.plannedDistance,
        maxParticipants: dto.maxParticipants,
        allowLateJoin: dto.allowLateJoin,
        shareRoutePublic: dto.shareRoutePublic,
        actualStartAt: dto.scheduledStartAt ? null : new Date(),
        participants: {
          create: {
            userId,
            role: ParticipantRole.ADMIN,
            status: ParticipantStatus.JOINED,
          },
        },
      },
      include: {
        creator: {
          select: { id: true, profile: { select: { displayName: true, avatarUrl: true } } },
        },
        participants: {
          include: {
            user: {
              select: { id: true, profile: { select: { displayName: true, avatarUrl: true } } },
            },
          },
        },
        _count: { select: { participants: true } },
      },
    });

    // Cache active session
    await this.redisService.set(
      `session:${session.id}:active`,
      JSON.stringify({ status: session.status, creatorId: userId }),
      3600,
    );

    this.logger.log(`Session created: ${session.id} by user ${userId}`);

    return this.mapToResponse(session);
  }

  async getSession(sessionId: string, userId?: string): Promise<SessionResponseDto> {
    const session = await this.prisma.runSession.findUnique({
      where: { id: sessionId },
      include: {
        creator: {
          select: { id: true, profile: { select: { displayName: true, avatarUrl: true } } },
        },
        participants: {
          where: { status: ParticipantStatus.JOINED },
          include: {
            user: {
              select: { id: true, profile: { select: { displayName: true, avatarUrl: true } } },
            },
          },
        },
        _count: { select: { participants: true } },
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    // Check access for private sessions
    if (session.privacy === 'PRIVATE' && userId) {
      const isParticipant = session.participants.some((p) => p.userId === userId);
      if (!isParticipant && session.creatorId !== userId) {
        throw new ForbiddenException('You do not have access to this session');
      }
    }

    return this.mapToResponse(session);
  }

  async listSessions(userId: string, filters: SessionFiltersDto): Promise<SessionListDto> {
    const where: Record<string, unknown> = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.privacy) {
      where.privacy = filters.privacy;
    }

    if (filters.creatorId) {
      where.creatorId = filters.creatorId;
    }

    if (filters.participating) {
      where.participants = {
        some: { userId, status: ParticipantStatus.JOINED },
      };
    }

    // Only show public sessions or sessions user is part of
    if (!filters.participating && !filters.creatorId) {
      where.OR = [
        { privacy: 'PUBLIC' },
        { creatorId: userId },
        { participants: { some: { userId } } },
      ];
    }

    const [sessions, total] = await Promise.all([
      this.prisma.runSession.findMany({
        where,
        include: {
          creator: {
            select: { id: true, profile: { select: { displayName: true, avatarUrl: true } } },
          },
          _count: { select: { participants: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: filters.offset || 0,
        take: filters.limit || 20,
      }),
      this.prisma.runSession.count({ where }),
    ]);

    return {
      sessions: sessions.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        status: s.status,
        privacy: s.privacy,
        scheduledStartAt: s.scheduledStartAt,
        actualStartAt: s.actualStartAt,
        participantCount: s._count.participants,
        maxParticipants: s.maxParticipants,
        creator: {
          id: s.creator.id,
          displayName: s.creator.profile?.displayName || 'Unknown',
          avatarUrl: s.creator.profile?.avatarUrl,
        },
      })),
      total,
      offset: filters.offset || 0,
      limit: filters.limit || 20,
    };
  }

  async updateSession(
    sessionId: string,
    userId: string,
    dto: UpdateSessionDto,
  ): Promise<SessionResponseDto> {
    const session = await this.prisma.runSession.findUnique({
      where: { id: sessionId },
      include: { participants: true },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    // Check if user is admin
    const participant = session.participants.find((p) => p.userId === userId);
    if (session.creatorId !== userId && participant?.role !== ParticipantRole.ADMIN) {
      throw new ForbiddenException('Only admins can update the session');
    }

    const updated = await this.prisma.runSession.update({
      where: { id: sessionId },
      data: {
        name: dto.name,
        description: dto.description,
        maxParticipants: dto.maxParticipants,
        allowLateJoin: dto.allowLateJoin,
        shareRoutePublic: dto.shareRoutePublic,
      },
      include: {
        creator: {
          select: { id: true, profile: { select: { displayName: true, avatarUrl: true } } },
        },
        participants: {
          include: {
            user: {
              select: { id: true, profile: { select: { displayName: true, avatarUrl: true } } },
            },
          },
        },
        _count: { select: { participants: true } },
      },
    });

    return this.mapToResponse(updated);
  }

  async startSession(sessionId: string, userId: string): Promise<SessionResponseDto> {
    const session = await this.prisma.runSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.creatorId !== userId) {
      throw new ForbiddenException('Only the creator can start the session');
    }

    if (session.status !== RunSessionStatus.SCHEDULED) {
      throw new BadRequestException('Session is not in scheduled state');
    }

    const updated = await this.prisma.runSession.update({
      where: { id: sessionId },
      data: {
        status: RunSessionStatus.ACTIVE,
        actualStartAt: new Date(),
      },
      include: {
        creator: {
          select: { id: true, profile: { select: { displayName: true, avatarUrl: true } } },
        },
        participants: {
          include: {
            user: {
              select: { id: true, profile: { select: { displayName: true, avatarUrl: true } } },
            },
          },
        },
        _count: { select: { participants: true } },
      },
    });

    // Update cache
    await this.redisService.set(
      `session:${sessionId}:active`,
      JSON.stringify({ status: 'ACTIVE', creatorId: userId }),
      3600,
    );

    this.logger.log(`Session started: ${sessionId}`);

    return this.mapToResponse(updated);
  }

  async endSession(sessionId: string, userId: string): Promise<SessionResponseDto> {
    const session = await this.prisma.runSession.findUnique({
      where: { id: sessionId },
      include: { participants: true },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.creatorId !== userId) {
      throw new ForbiddenException('Only the creator can end the session');
    }

    if (session.status !== RunSessionStatus.ACTIVE) {
      throw new BadRequestException('Session is not active');
    }

    // Calculate total distance from all participants
    const totalDistance = session.participants.reduce((sum, p) => sum + p.distance, 0);

    const updated = await this.prisma.runSession.update({
      where: { id: sessionId },
      data: {
        status: RunSessionStatus.COMPLETED,
        endedAt: new Date(),
        actualDistance: totalDistance,
      },
      include: {
        creator: {
          select: { id: true, profile: { select: { displayName: true, avatarUrl: true } } },
        },
        participants: {
          include: {
            user: {
              select: { id: true, profile: { select: { displayName: true, avatarUrl: true } } },
            },
          },
        },
        _count: { select: { participants: true } },
      },
    });

    // Clear cache and geo data
    await this.redisService.del(`session:${sessionId}:active`);
    await this.geoService.cleanupSession(sessionId);

    this.logger.log(`Session ended: ${sessionId}`);

    return this.mapToResponse(updated);
  }

  async joinSession(sessionId: string, userId: string): Promise<SessionResponseDto> {
    return this.participantService.joinSession(sessionId, userId);
  }

  async leaveSession(sessionId: string, userId: string): Promise<void> {
    await this.participantService.leaveSession(sessionId, userId);
  }

  async getActiveSessionForUser(userId: string): Promise<SessionResponseDto | null> {
    const participant = await this.prisma.runParticipant.findFirst({
      where: {
        userId,
        status: ParticipantStatus.JOINED,
        session: { status: RunSessionStatus.ACTIVE },
      },
      include: {
        session: {
          include: {
            creator: {
              select: { id: true, profile: { select: { displayName: true, avatarUrl: true } } },
            },
            participants: {
              include: {
                user: {
                  select: { id: true, profile: { select: { displayName: true, avatarUrl: true } } },
                },
              },
            },
            _count: { select: { participants: true } },
          },
        },
      },
    });

    if (!participant) {
      return null;
    }

    return this.mapToResponse(participant.session);
  }

  private mapToResponse(session: {
    id: string;
    name: string;
    description: string | null;
    status: RunSessionStatus;
    privacy: string;
    scheduledStartAt: Date | null;
    actualStartAt: Date | null;
    endedAt: Date | null;
    startLatitude: number | null;
    startLongitude: number | null;
    plannedDistance: number | null;
    actualDistance: number | null;
    maxParticipants: number;
    allowLateJoin: boolean;
    shareRoutePublic: boolean;
    createdAt: Date;
    creator: {
      id: string;
      profile: { displayName: string; avatarUrl: string | null } | null;
    };
    participants: Array<{
      id: string;
      userId: string;
      role: ParticipantRole;
      status: ParticipantStatus;
      distance: number;
      duration: number;
      averagePace: number | null;
      user: {
        id: string;
        profile: { displayName: string; avatarUrl: string | null } | null;
      };
    }>;
    _count: { participants: number };
  }): SessionResponseDto {
    return {
      id: session.id,
      name: session.name,
      description: session.description,
      status: session.status,
      privacy: session.privacy,
      scheduledStartAt: session.scheduledStartAt,
      actualStartAt: session.actualStartAt,
      endedAt: session.endedAt,
      startLocation: session.startLatitude && session.startLongitude
        ? { latitude: session.startLatitude, longitude: session.startLongitude }
        : null,
      plannedDistance: session.plannedDistance,
      actualDistance: session.actualDistance,
      maxParticipants: session.maxParticipants,
      allowLateJoin: session.allowLateJoin,
      shareRoutePublic: session.shareRoutePublic,
      createdAt: session.createdAt,
      creator: {
        id: session.creator.id,
        displayName: session.creator.profile?.displayName || 'Unknown',
        avatarUrl: session.creator.profile?.avatarUrl,
      },
      participants: session.participants.map((p) => ({
        id: p.id,
        userId: p.userId,
        role: p.role,
        status: p.status,
        displayName: p.user.profile?.displayName || 'Unknown',
        avatarUrl: p.user.profile?.avatarUrl,
        stats: {
          distance: p.distance,
          duration: p.duration,
          averagePace: p.averagePace,
        },
      })),
      participantCount: session._count.participants,
    };
  }
}

