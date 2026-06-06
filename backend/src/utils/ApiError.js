import { HTTP_STATUS } from '../constants/index.js';

/**
 * Operational error class. Anything thrown as an ApiError is "expected" (bad
 * input, auth failure, etc.) and is safe to surface to the client. Unexpected
 * errors bubble up as 500s with their detail hidden in production.
 */
export default class ApiError extends Error {
  constructor(statusCode, message, { details = null, isOperational = true } = {}) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = isOperational;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Bad request', details = null) {
    return new ApiError(HTTP_STATUS.BAD_REQUEST, message, { details });
  }

  static unauthorized(message = 'Authentication required') {
    return new ApiError(HTTP_STATUS.UNAUTHORIZED, message);
  }

  static forbidden(message = 'Access denied') {
    return new ApiError(HTTP_STATUS.FORBIDDEN, message);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(HTTP_STATUS.NOT_FOUND, message);
  }

  static conflict(message = 'Conflict') {
    return new ApiError(HTTP_STATUS.CONFLICT, message);
  }

  static tooMany(message = 'Too many requests') {
    return new ApiError(HTTP_STATUS.TOO_MANY_REQUESTS, message);
  }

  static internal(message = 'Internal server error') {
    return new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, message, { isOperational: false });
  }
}
