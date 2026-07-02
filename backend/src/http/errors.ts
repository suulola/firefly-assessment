export interface HttpErrorOptions {
  code?: string;
  cause?: unknown;
}

export class HttpError extends Error {
  readonly statusCode: number;
  readonly code: string;

  constructor(statusCode: number, message: string, options: HttpErrorOptions = {}) {
    super(message, { cause: options.cause });
    this.name = "HttpError";
    this.statusCode = statusCode;
    this.code = options.code ?? "HTTP_ERROR";
  }
}

export class BadRequestError extends HttpError {
  constructor(message: string, code = "BAD_REQUEST") {
    super(400, message, { code });
    this.name = "BadRequestError";
  }
}

export function isHttpError(error: unknown): error is HttpError {
  return error instanceof HttpError;
}
