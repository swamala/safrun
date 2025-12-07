import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditLogService } from '../security/audit-log.service';
import { AuditAction } from '@prisma/client';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private readonly auditLogService: AuditLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const path = request.path;
    const userId = request.user?.id;

    // Only log mutating operations
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next.handle();
    }

    const action = this.getActionFromMethod(method);
    const resource = this.getResourceFromPath(path);

    return next.handle().pipe(
      tap({
        next: (response: unknown) => {
          // Log successful operation
          this.auditLogService.log({
            userId,
            action,
            resource,
            resourceId: this.getResourceId(path, response),
            details: {
              method,
              path,
              body: this.sanitizeBody(request.body),
            },
            ipAddress: request.ip,
            userAgent: request.headers['user-agent'],
          });
        },
        error: (error: Error) => {
          // Log failed operation
          this.auditLogService.log({
            userId,
            action,
            resource,
            details: {
              method,
              path,
              error: error.message,
            },
            ipAddress: request.ip,
            userAgent: request.headers['user-agent'],
          });
        },
      }),
    );
  }

  private getActionFromMethod(method: string): AuditAction {
    switch (method) {
      case 'POST':
        return AuditAction.CREATE;
      case 'PUT':
      case 'PATCH':
        return AuditAction.UPDATE;
      case 'DELETE':
        return AuditAction.DELETE;
      default:
        return AuditAction.UPDATE;
    }
  }

  private getResourceFromPath(path: string): string {
    const segments = path.split('/').filter(Boolean);
    // Return the first meaningful segment after 'api/v1'
    return segments[2] || segments[1] || 'unknown';
  }

  private getResourceId(path: string, response: unknown): string | undefined {
    // Try to extract ID from path
    const uuidMatch = path.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
    if (uuidMatch) return uuidMatch[0];

    // Try to get ID from response
    if (response && typeof response === 'object' && 'id' in response) {
      return (response as { id: string }).id;
    }

    return undefined;
  }

  private sanitizeBody(body: Record<string, unknown>): Record<string, unknown> {
    if (!body) return {};

    const sensitiveFields = ['password', 'passwordHash', 'token', 'refreshToken', 'secret'];
    const sanitized = { ...body };

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }
}

