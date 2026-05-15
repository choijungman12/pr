import { HttpStatus } from '@nestjs/common';

export class BaseResponse<T>{
    timestamp: string;
    status: number;
    code: string;
    data: T;

    private constructor(data: T, status: number, code: string){
        this.timestamp = new Date().toISOString();
        this.status = status;
        this.code = code;
        this.data = data;
    }

    static of<T>(data: T, status = 200, code = this.HttpStatusText[HttpStatus.OK]): BaseResponse<T> {
        return new BaseResponse<T>(data, status, code);
    }

    static readonly HttpStatusText = {
        [HttpStatus.OK]: 'OK',
        [HttpStatus.CREATED]: 'Created',
        [HttpStatus.BAD_REQUEST]: 'Bad Request',
        [HttpStatus.NOT_FOUND]: 'Not Found',
        [HttpStatus.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
    };
}

