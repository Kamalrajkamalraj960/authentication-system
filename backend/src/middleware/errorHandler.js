import mongoose from 'mongoose';
import config from '../config/index.js';
import logger from '../utils/logger.js';
import ApiError from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/index.js';

/** 404 handler for unmatched routes. */
export const notFoundHandler = (req, _res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

/**
 * Centralized error handler. Normalizes known error shapes (Mongoose
 * validation/cast/duplicate-key, JWT) into clean ApiError responses and hides
 * internal details for unexpected 500s in production.
 */
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, _next) => {
  let error = err;

  // Mongoose: bad ObjectId
  if (err instanceof mongoose.Error.CastError) {
    error = ApiError.badRequest(`Invalid ${err.path}: ${err.value}`);
  }

  // Mongoose: schema validation
  if (err instanceof mongoose.Error.ValidationError) {
    const details = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    error = ApiError.badRequest('Validation failed', details);
  }

  // MongoDB: duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    error = ApiError.conflict(`An account with that ${field} already exists`);
  }

  // JWT errors that escaped the token service
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    error = ApiError.unauthorized('Invalid or expired token');
  }

  if (!(error instanceof ApiError)) {
    error = new ApiError(
      err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      err.message || 'Internal server error',
      { isOperational: false }
    );
  }

  const status = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;

  if (status >= 500 || !error.isOperational) {
    logger.error(`${req.method} ${req.originalUrl} -> ${status}: ${err.message}\n${err.stack}`);
  } else {
    logger.warn(`${req.method} ${req.originalUrl} -> ${status}: ${error.message}`);
  }

  const body = {
    success: false,
    message:
      status >= 500 && config.isProduction ? 'Something went wrong, please try again later.' : error.message,
    data: error.details ? { errors: error.details } : null,
  };

  if (!config.isProduction && status >= 500) {
    body.stack = err.stack;
  }

  return res.status(status).json(body);
};

export default errorHandler;
