import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@/core/prisma/prisma.service';
import { GeoService } from '@/core/redis/geo.service';
import { RunSessionStatus, ParticipantRole, ParticipantStatus } from '@prisma/client';
import { SessionResponseDto } from '../dto/session.dto';

@Injectable()
export class ParticipantService {
  private readonly logger = new Logger(ParticipantService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly geoService: GeoService,
  ) {}

  async joinSession(sessionId: string, userId: string): Promise<SessionResponseDto> {
    const session = await this.prisma.runSession.findUnique({
      where: { id: sessionId },
      include: {
        participants: true,
        _count: { select: { participants: true } },
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    // Check if session is joinable
    if (session.status === RunSessionStatus.COMPLETED || session.status === RunSessionStatus.CANCELLED) {
      throw new BadRequestException('Session is no longer available');
    }

    if (session.status === RunSessionStatus.ACTIVE && !session.allowLateJoin) {
      throw new BadRequestException('Late joining is not allowed for this session');
    }

    // Check if already participating
    const existingParticipant = session.participants.find((p) => p.userId === userId);
    if (existingParticipant && existingParticipant.status === ParticipantStatus.JOINED) {
      throw new BadRequestException('You are already in this session');
    }

    // Check max participants
    const activeParticipants = session.participants.filter(
      (p) => p.status === ParticipantStatus.JOINED,
    ).length;
    if (activeParticipants >= session.maxParticipants) {
      throw new BadRequestException('Session is full');
    }

    // Join or rejoin
    if (existingParticipant) {
      await this.prisma.runParticipant.update({
        where: { id: existingParticipant.id },
        data: {
          status: ParticipantStatus.JOINED,
          joinedAt: new Date(),
          leftAt: null,
        },
      });
    } else {
      await this.prisma.runParticipant.create({
        data: {
          sessionId,
          userId,
          role: ParticipantRole.MEMBER,
          status: ParticipantStatus.JOINED,
        },
      });
    }

    this.logger.log(`User ${userId} joined session ${sessionId}`);

    // Return updated session
    const updatedSession = await this.prisma.runSession.findUnique({
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

    return this.mapToResponse(updatedSession!);
  }

  async leaveSession(sessionId: string, userId: string): Promise<void> {
    const session = await this.prisma.runSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    const participant = await this.prisma.runParticipant.findFirst({
      where: { sessionId, userId },
    });

    if (!participant) {
      throw new BadRequestException('You are not in this session');
    }

    // Creator cannot leave, they must end the session
    if (session.creatorId === userId) {
      throw new ForbiddenException('Session creator cannot leave. End the session instead.');
    }

    await this.prisma.runParticipant.update({
      where: { id: participant.id },
      data: {
        status: ParticipantStatus.LEFT,
        leftAt: new Date(),
      },
    });

    // Remove from geo index
    await this.geoService.removeRunner(userId, sessionId);

    this.logger.log(`User ${userId} left session ${sessionId}`);
  }

  async updateParticipantStats(
    sessionId: string,
    userId: string,
    stats: { distance: number; duration: number; averagePace?: number; maxSpeed?: number },
  ): Promise<void> {
    await this.prisma.runParticipant.updateMany({
      where: { sessionId, userId },
      data: {
        distance: stats.distance,
        duration: stats.duration,
        averagePace: stats.averagePace,
        maxSpeed: stats.maxSpeed,
      },
    });
  }

  async getSessionParticipants(sessionId: string) {
    return this.prisma.runParticipant.findMany({
      where: { sessionId, status: ParticipantStatus.JOINED },
      include: {
        user: {
          select: { id: true, profile: { select: { displayName: true, avatarUrl: true } } },
        },
      },
    });
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
      startLocation:
        session.startLatitude && session.startLongitude
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

