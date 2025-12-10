import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { map } from 'rxjs/operators';
import { ApiResponseDto } from '../dto/api-response.dto';

/**
 * Interceptor to transform all responses to standard API response format
 */
@Injectable()
export class ResponseTransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      map((data) => {
        // If already wrapped in ApiResponseDto, return as-is
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        // Handle null/undefined
        if (data === null || data === undefined) {
          return ApiResponseDto.success(null);
        }

        // Wrap in standard response
        return ApiResponseDto.success(data);
      }),
    );
  }
}
