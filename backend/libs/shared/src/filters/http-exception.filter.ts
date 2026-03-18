import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { StandardErrorResponse } from './standard-error.response';

const HTTP_STATUS_TEXTS: Partial<Record<number, string>> = {
  [HttpStatus.BAD_REQUEST]: 'Bad Request',
  [HttpStatus.UNAUTHORIZED]: 'Unauthorized',
  [HttpStatus.FORBIDDEN]: 'Forbidden',
  [HttpStatus.NOT_FOUND]: 'Not Found',
  [HttpStatus.CONFLICT]: 'Conflict',
  [HttpStatus.UNPROCESSABLE_ENTITY]: 'Unprocessable Entity',
  [HttpStatus.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
};

function getErrorText(statusCode: number): string {
  return HTTP_STATUS_TEXTS[statusCode] ?? 'Error';
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode: number;
    let message: string;
    let details: unknown;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
        details = undefined;
      } else if (typeof res === 'object' && res !== null) {
        const obj = res as Record<string, unknown>;
        message = (obj.message as string) ?? getErrorText(statusCode);
        details = obj.errors ?? obj.details;
      } else {
        message = getErrorText(statusCode);
        details = undefined;
      }
    } else {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      details = undefined;
      this.logger.error(
        `${request.method} ${request.url} - ${String(exception)}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    const body: StandardErrorResponse = {
      statusCode,
      error: getErrorText(statusCode),
      message,
      timestamp: new Date().toISOString(),
    };
    if (details !== undefined && details !== null) {
      body.details = details;
    }

    response.status(statusCode).json(body);
  }
}
