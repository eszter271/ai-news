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
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = '服务器内部错误';
    let code: number | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const resp = exception.getResponse() as any;
      message =
        typeof resp === 'string'
          ? resp
          : resp?.message
            ? Array.isArray(resp.message)
              ? resp.message[0]
              : resp.message
            : exception.message;
      code = resp?.code;
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(`${request.method} ${request.url}: ${exception.stack || message}`);
    }

    response.status(status).json({
      code: status,
      message,
      ...(code ? { errorCode: code } : {}),
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
