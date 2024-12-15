export class HttpException extends Error {
  message: string;
  statusCode: number;
  errorCode: ErrorCode;
  errors: any;
  constructor(
    message: string,
    errorCode: ErrorCode,
    statusCode: number,
    errors: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.errorCode = errorCode;
    this.errors = errors;
  }
}

export enum ErrorCode {
  USER_NOT_FOUND = 404,
  USER_ALREADY_EXISTS = 409,
  INVALID_PASSWORD = 401,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_EXCEPTION = 500,
  UNAUTHORIZED = 401,
}
