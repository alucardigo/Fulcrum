import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Erro interno do servidor';
    let details = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const response = exception.getResponse();
      message = typeof response === 'string' ? response : (response as any).message;
      details = typeof response === 'string' ? null : (response as any).details;
    } else if (exception instanceof ZodError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Erro de validação';
      details = exception.errors.map((error) => ({
        field: error.path.join('.'),
        message: error.message,
      }));
    } else if (exception instanceof PrismaClientKnownRequestError) {
      status = HttpStatus.BAD_REQUEST;
      switch (exception.code) {
        case 'P2002':
          message = 'Registro duplicado';
          details = `O campo ${(exception.meta as any).target} já existe`;
          break;
        case 'P2025':
          message = 'Registro não encontrado';
          break;
        default:
          message = 'Erro no banco de dados';
      }
    }

    // Log do erro
    this.logger.error(
      `[${request.method}] ${request.url} - ${status} - ${message}`,
      exception instanceof Error ? exception.stack : null,
    );

    // Resposta formatada
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      details,
    });
  }
}
