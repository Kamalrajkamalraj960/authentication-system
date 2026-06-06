import ApiError from '../utils/ApiError.js';
import { MESSAGES } from '../constants/index.js';

/**
 * Role-based authorization guard. Use AFTER `authenticate`.
 *
 *   router.get('/admin', authenticate, authorizeRoles('admin'), handler)
 *
 * Returns 403 { message: 'Access denied' } for users lacking a permitted role.
 */
export const authorizeRoles = (...allowedRoles) => (req, _res, next) => {
  if (!req.user) return next(ApiError.unauthorized(MESSAGES.UNAUTHORIZED));
  if (!allowedRoles.includes(req.user.role)) {
    return next(ApiError.forbidden(MESSAGES.ACCESS_DENIED));
  }
  return next();
};

export default authorizeRoles;
