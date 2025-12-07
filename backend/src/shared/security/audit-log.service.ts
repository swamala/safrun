import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/core/prisma/prisma.service';
import { AuditAction } from '@prisma/client';

export interface AuditLogEntry {
  userId?: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(entry: AuditLogEntry): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: entry.userId,
          action: entry.action,
          resource: entry.resource,
          resourceId: entry.resourceId,
          details: entry.details,
          ipAddress: entry.ipAddress,
          userAgent: entry.userAgent,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to create audit log: ${(error as Error).message}`);
    }
  }

  async logUserAction(
    userId: string,
    action: AuditAction,
    resource: string,
    resourceId?: string,
    details?: Record<string, unknown>,
  ): Promise<void> {
    await this.log({
      userId,
      action,
      resource,
      resourceId,
      details,
    });
  }

  async logSOSEvent(
    userId: string,
    action: 'SOS_TRIGGER' | 'SOS_ACKNOWLEDGE',
    sosAlertId: string,
    details?: Record<string, unknown>,
  ): Promise<void> {
    await this.log({
      userId,
      action: action === 'SOS_TRIGGER' ? AuditAction.SOS_TRIGGER : AuditAction.SOS_ACKNOWLEDGE,
      resource: 'sos_alert',
      resourceId: sosAlertId,
      details,
    });
  }

  async logLocationUpdate(
    userId: string,
    sessionId?: string,
    details?: Record<string, unknown>,
  ): Promise<void> {
    await this.log({
      userId,
      action: AuditAction.LOCATION_UPDATE,
      resource: 'location',
      resourceId: sessionId,
      details,
    });
  }

  async logSessionActivity(
    userId: string,
    sessionId: string,
    action: 'JOIN' | 'LEAVE',
  ): Promise<void> {
    await this.log({
      userId,
      action: action === 'JOIN' ? AuditAction.SESSION_JOIN : AuditAction.SESSION_LEAVE,
      resource: 'session',
      resourceId: sessionId,
    });
  }

  async getRecentLogs(
    userId: string,
    limit = 50,
  ): Promise<{
    id: string;
    action: AuditAction;
    resource: string;
    resourceId: string | null;
    details: unknown;
    createdAt: Date;
  }[]> {
    return this.prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        action: true,
        resource: true,
        resourceId: true,
        details: true,
        createdAt: true,
      },
    });
  }

  async getSecurityEvents(
    startDate: Date,
    endDate: Date,
  ): Promise<{
    id: string;
    userId: string | null;
    action: AuditAction;
    resource: string;
    details: unknown;
    ipAddress: string | null;
    createdAt: Date;
  }[]> {
    return this.prisma.auditLog.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        action: {
          in: [AuditAction.LOGIN, AuditAction.LOGOUT, AuditAction.SOS_TRIGGER],
        },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        userId: true,
        action: true,
        resource: true,
        details: true,
        ipAddress: true,
        createdAt: true,
      },
    });
  }
}

