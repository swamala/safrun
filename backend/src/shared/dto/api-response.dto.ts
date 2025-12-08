import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Standard API Response wrapper for consistent response shape
 */
export class ApiResponseDto<T = any> {
  @ApiProperty({ description: 'Whether the request was successful' })
  success: boolean;

  @ApiPropertyOptional({ description: 'Response data (when successful)' })
  data?: T;

  @ApiPropertyOptional({ description: 'Error message (when failed)' })
  error?: string;

  @ApiPropertyOptional({ description: 'Error code for client handling' })
  errorCode?: string;

  @ApiPropertyOptional({ description: 'Request timestamp' })
  timestamp?: string;

  constructor(partial: Partial<ApiResponseDto<T>>) {
    Object.assign(this, partial);
    this.timestamp = new Date().toISOString();
  }

  static success<T>(data: T): ApiResponseDto<T> {
    return new ApiResponseDto<T>({ success: true, data });
  }

  static error(message: string, errorCode?: string): ApiResponseDto<null> {
    return new ApiResponseDto<null>({ success: false, error: message, errorCode });
  }
}

/**
 * Paginated response wrapper
 */
export class PaginatedResponseDto<T> {
  @ApiProperty({ description: 'Whether the request was successful' })
  success: boolean;

  @ApiProperty({ description: 'Response data items' })
  data: T[];

  @ApiProperty({ description: 'Total number of items' })
  total: number;

  @ApiProperty({ description: 'Current page offset' })
  offset: number;

  @ApiProperty({ description: 'Items per page' })
  limit: number;

  @ApiProperty({ description: 'Whether there are more items' })
  hasMore: boolean;

  @ApiPropertyOptional({ description: 'Request timestamp' })
  timestamp?: string;

  constructor(items: T[], total: number, offset: number, limit: number) {
    this.success = true;
    this.data = items;
    this.total = total;
    this.offset = offset;
    this.limit = limit;
    this.hasMore = offset + limit < total;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Standard pagination query DTO
 */
export class PaginationQueryDto {
  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  limit?: number = 20;

  @ApiPropertyOptional({ default: 0, minimum: 0 })
  offset?: number = 0;
}

