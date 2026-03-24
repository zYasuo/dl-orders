import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type PaginatedResponse<T> = {
  data: T[];
  meta: PaginationMeta;
};

type SuccessResponse<T> = {
  success: true;
  timestamp: string;
  data: T;
};

type SuccessPaginatedResponse<T> = {
  success: true;
  timestamp: string;
  data: T[];
  meta: PaginationMeta;
};

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<SuccessResponse<unknown> | SuccessPaginatedResponse<unknown>> {
    return next.handle().pipe(
      map((response: unknown) => {
        const timestamp = new Date().toISOString();

        if (this.isPaginated(response)) {
          return {
            success: true,
            timestamp,
            data: response.data,
            meta: response.meta,
          };
        }

        return {
          success: true,
          timestamp,
          data: response,
        };
      }),
    );
  }

  private isPaginated(value: unknown): value is PaginatedResponse<unknown> {
    if (typeof value !== 'object' || value === null) {
      return false;
    }

    const candidate = value as Partial<PaginatedResponse<unknown>>;

    if (!Array.isArray(candidate.data)) {
      return false;
    }

    if (typeof candidate.meta !== 'object' || candidate.meta === null) {
      return false;
    }

    const meta = candidate.meta as Partial<PaginationMeta>;

    return (
      typeof meta.page === 'number' &&
      typeof meta.limit === 'number' &&
      typeof meta.total === 'number' &&
      typeof meta.totalPages === 'number'
    );
  }
}
