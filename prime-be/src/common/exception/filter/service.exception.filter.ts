import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { ServiceException } from '../service/service.exception';
import { Request, Response } from 'express';

@Catch(ServiceException)
export class ServiceExceptionFilter implements ExceptionFilter {
  catch(exception: ServiceException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.errorCode.status;
    const message = exception.message;

    response.status(status).json({
      statusCode: status,
      path: request.url,
      message: message,
      timestamp: new Date().toISOString(),
    });
  }
}
