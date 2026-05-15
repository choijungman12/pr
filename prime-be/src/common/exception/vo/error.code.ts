class ErrorCodeVo {
  readonly status: number;
  readonly message: string;

  constructor(status: number, message: string) {
    this.status = status;
    this.message = message;
  }
}

export type ErrorCode = ErrorCodeVo;

export const SUCCESS = new ErrorCodeVo(200, '성공적으로 처리되었습니다.');
export const CREATED_RESOURCE = new ErrorCodeVo(201, '리소스가 생성되었습니다.');
export const ACCEPTED = new ErrorCodeVo(202, '요청이 접수되었습니다.');
export const NO_CONTENT = new ErrorCodeVo(204, '콘텐츠가 없습니다.');

export const BAD_REQUEST = new ErrorCodeVo(400, '잘못된 요청입니다.');
export const UNAUTHORIZED = new ErrorCodeVo(401, '권한 인증에 실패하였습니다.');
export const FORBIDDEN = new ErrorCodeVo(403, '접근이 거부되었습니다.');
export const NOT_FOUND = new ErrorCodeVo(404, '리소스를 찾을 수 없습니다.');
export const METHOD_NOT_ALLOWED = new ErrorCodeVo(405, '허용되지 않는 메소드입니다.');
export const CONFLICT = new ErrorCodeVo(409, '리소스에서 충돌이 발생했습니다.');
export const UNSUPPORTED_MEDIA_TYPE = new ErrorCodeVo(415, '지원하지 않는 미디어 타입입니다.');
export const UNPROCESSABLE_ENTITY = new ErrorCodeVo(422, '처리할 수 없는 엔티티입니다.');
export const TOO_MANY_REQUESTS = new ErrorCodeVo(429, '너무 많은 요청이 발생했습니다.');

export const INTERNAL_SERVER_ERROR = new ErrorCodeVo(500, '서버 내부 오류가 발생했습니다.');
export const NOT_IMPLEMENTED = new ErrorCodeVo(501, '구현되지 않은 기능입니다.');
export const BAD_GATEWAY = new ErrorCodeVo(502, '게이트웨이 오류가 발생했습니다.');
export const SERVICE_UNAVAILABLE = new ErrorCodeVo(503, '서비스를 사용할 수 없습니다.');
export const GATEWAY_TIMEOUT = new ErrorCodeVo(504, '게이트웨이 시간 초과가 발생했습니다.');
