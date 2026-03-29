import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const res = exceptionResponse as any;
        message = res.message || exception.message;
        error = res.error || exception.name;
      } else {
        message = exceptionResponse as string;
        error = exception.name;
      }
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const prismaError = this.handlePrismaError(exception);
      statusCode = prismaError.statusCode;
      message = prismaError.message;
      error = prismaError.error;
    } else if (exception instanceof Error) {
      this.logger.error(`Unhandled error: ${exception.message}`, exception.stack);
      message = 'An unexpected error occurred';
    }

    this.logger.error(
      `${request.method} ${request.url} → ${statusCode}`,
    );

    response.status(statusCode).json({
      statusCode,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private handlePrismaError(exception: Prisma.PrismaClientKnownRequestError) {
    switch (exception.code) {
      case 'P2002':
        return {
          statusCode: HttpStatus.CONFLICT,
          message: `A record with this value already exists`,
          error: 'Conflict',
        };
      case 'P2025':
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'The requested record was not found',
          error: 'Not Found',
        };
      case 'P2003':
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Foreign key constraint failed',
          error: 'Bad Request',
        };
      default:
        this.logger.error(`Prisma error ${exception.code}: ${exception.message}`);
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Database error occurred',
          error: 'Internal Server Error',
        };
    }
  }
}
