import tokenService from '../services/token.service.js';
import userRepository from '../repositories/user.repository.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { COOKIE_NAMES, MESSAGES, TOKEN_TYPES } from '../constants/index.js';

/**
 * Extract the access token from the Authorization header (Bearer) or the
 * httpOnly cookie. Header takes precedence for API clients; cookie supports the
 * browser SPA flow.
 */
const extractToken = (req) => {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) return header.slice(7);
  if (req.cookies?.[COOKIE_NAMES.ACCESS_TOKEN]) return req.cookies[COOKIE_NAMES.ACCESS_TOKEN];
  return null;
};

/**
 * Authentication guard. Verifies the access token, loads the user, and rejects
 * tokens issued before the user's last password change.
 */
export const authenticate = asyncHandler(async (req, _res, next) => {
  const token = extractToken(req);
  if (!token) throw ApiError.unauthorized(MESSAGES.UNAUTHORIZED);

  const payload = tokenService.verifyAccessToken(token);
  if (payload.type !== TOKEN_TYPES.ACCESS) throw ApiError.unauthorized(MESSAGES.INVALID_TOKEN);

  const user = await userRepository.findById(payload.sub, { select: '+passwordChangedAt' });
  if (!user) throw ApiError.unauthorized(MESSAGES.UNAUTHORIZED);

  if (user.passwordChangedAfter(payload.iat)) {
    throw ApiError.unauthorized('Password recently changed. Please log in again.');
  }

  req.user = user;
  req.token = token;
  return next();
});

export default authenticate;
