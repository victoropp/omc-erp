import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Unknown error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        message = (exceptionResponse as any).message || exception.message;
        error = (exceptionResponse as any).error || exception.name;
      }
    } else if (exception.statusCode) {
      // Handle proxy service errors
      status = exception.statusCode;
      message = exception.message || 'Service error';
      error = exception.error || 'Service error';
    } else {
      // Handle unexpected errors
      message = exception.message || 'Internal server error';
      error = exception.name || 'UnknownError';
    }

    const errorResponse = {
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      requestId: request.headers['x-request-id'] || 'unknown',
      service: exception.service || 'api-gateway',
    };

    // Log the error
    this.logger.error(
      `${request.method} ${request.url} ${status} - ${message}`,
      {
        ...errorResponse,
        stack: exception.stack,
      }
    );

    response.status(status).json(errorResponse);
  }
}