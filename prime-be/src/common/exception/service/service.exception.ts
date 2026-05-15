import * as ErrorCode from '../vo/error.code';

export class ServiceException extends Error {
  readonly errorCode: ErrorCode.ErrorCode;

  constructor(errorCode: ErrorCode.ErrorCode, message?: string) {
    if (!message) {
      message = errorCode.message;
    }
    super(message);
    this.errorCode = errorCode;
  }
}

export const SuccessException = (message?: string): ServiceException => {
  return new ServiceException(ErrorCode.SUCCESS, message);
};

export const CreatedResourceException = (message?: string): ServiceException => {
  return new ServiceException(ErrorCode.CREATED_RESOURCE, message);
};

export const AcceptedException = (message?: string): ServiceException => {
  return new ServiceException(ErrorCode.ACCEPTED, message);
};

export const NoContentException = (message?: string): ServiceException => {
  return new ServiceException(ErrorCode.NO_CONTENT, message);
};

export const BadRequestException = (message?: string): ServiceException => {
  return new ServiceException(ErrorCode.BAD_REQUEST, message);
};

export const UnauthorizedException = (message?: string): ServiceException => {
  return new ServiceException(ErrorCode.UNAUTHORIZED, message);
};

export const ForbiddenException = (message?: string): ServiceException => {
  return new ServiceException(ErrorCode.FORBIDDEN, message);
};

export const NotFoundException = (message?: string): ServiceException => {
  return new ServiceException(ErrorCode.NOT_FOUND, message);
};

export const MethodNotAllowedException = (message?: string): ServiceException => {
  return new ServiceException(ErrorCode.METHOD_NOT_ALLOWED, message);
};

export const ConflictException = (message?: string): ServiceException => {
  return new ServiceException(ErrorCode.CONFLICT, message);
};

export const UnsupportedMediaTypeException = (message?: string): ServiceException => {
  return new ServiceException(ErrorCode.UNSUPPORTED_MEDIA_TYPE, message);
};

export const UnprocessableEntityException = (message?: string): ServiceException => {
  return new ServiceException(ErrorCode.UNPROCESSABLE_ENTITY, message);
};

export const TooManyRequestsException = (message?: string): ServiceException => {
  return new ServiceException(ErrorCode.TOO_MANY_REQUESTS, message);
};

export const InternalServerErrorException = (message?: string): ServiceException => {
  return new ServiceException(ErrorCode.INTERNAL_SERVER_ERROR, message);
};

export const NotImplementedException = (message?: string): ServiceException => {
  return new ServiceException(ErrorCode.NOT_IMPLEMENTED, message);
};

export const BadGatewayException = (message?: string): ServiceException => {
  return new ServiceException(ErrorCode.BAD_GATEWAY, message);
};

export const ServiceUnavailableException = (message?: string): ServiceException => {
  return new ServiceException(ErrorCode.SERVICE_UNAVAILABLE, message);
};

export const GatewayTimeoutException = (message?: string): ServiceException => {
  return new ServiceException(ErrorCode.GATEWAY_TIMEOUT, message);
};
