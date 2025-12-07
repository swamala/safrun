import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/core/prisma/prisma.service';
import { ParticipantStatus } from '@prisma/client';
import { LeaderboardResponseDto, LeaderboardEntryDto } from '../dto/session.dto';

@Injectable()
export class LeaderboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSessionLeaderboard(sessionId: string): Promise<LeaderboardResponseDto> {
    const session = await this.prisma.runSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    const participants = await this.prisma.runParticipant.findMany({
      where: { sessionId, status: ParticipantStatus.JOINED },
      include: {
        user: {
          select: { id: true, profile: { select: { displayName: true, avatarUrl: true } } },
        },
      },
    });

    // Sort by distance
    const byDistance = [...participants]
      .sort((a, b) => b.distance - a.distance)
      .map((p, index) => this.mapToEntry(p, index + 1));

    // Sort by pace (lower is better, exclude nulls)
    const byPace = [...participants]
      .filter((p) => p.averagePace !== null && p.averagePace > 0)
      .sort((a, b) => (a.averagePace || Infinity) - (b.averagePace || Infinity))
      .map((p, index) => this.mapToEntry(p, index + 1));

    return {
      sessionId,
      byDistance,
      byPace,
    };
  }

  private mapToEntry(
    participant: {
      userId: string;
      distance: number;
      duration: number;
      averagePace: number | null;
      maxSpeed: number | null;
      user: {
        id: string;
        profile: { displayName: string; avatarUrl: string | null } | null;
      };
    },
    rank: number,
  ): LeaderboardEntryDto {
    return {
      rank,
      userId: participant.userId,
      displayName: participant.user.profile?.displayName || 'Unknown',
      avatarUrl: participant.user.profile?.avatarUrl,
      distance: participant.distance,
      duration: participant.duration,
      averagePace: participant.averagePace,
      maxSpeed: participant.maxSpeed,
    };
  }
}

