import rateLimit from 'express-rate-limit';
import config from '../config/index.js';
import { HTTP_STATUS, MESSAGES } from '../constants/index.js';

const handler = (_req, res) =>
  res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
    success: false,
    message: 'Too many requests, please try again later.',
    data: null,
  });

/** Global API limiter (generous) — first line of defence against abuse. */
export const globalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
  skip: () => config.isTest,
});

/**
 * Strict limiter for sensitive auth endpoints (login, register, forgot/reset).
 * Mitigates brute-force and credential-stuffing attacks.
 */
export const authLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.authMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: MESSAGES.ACCESS_DENIED,
  handler,
  skip: () => config.isTest,
});

export default { globalLimiter, authLimiter };
