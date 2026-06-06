/**
 * Application-wide constants. Centralizing magic strings here prevents typos
 * across the controller/service/model layers and makes refactors safe.
 */

export const ROLES = Object.freeze({
  ADMIN: 'admin',
  USER: 'user',
});

export const PROVIDERS = Object.freeze({
  LOCAL: 'local',
  GOOGLE: 'google',
});

export const TOKEN_TYPES = Object.freeze({
  ACCESS: 'access',
  REFRESH: 'refresh',
});

export const COOKIE_NAMES = Object.freeze({
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
});

export const HTTP_STATUS = Object.freeze({
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
});

export const MESSAGES = Object.freeze({
  ACCESS_DENIED: 'Access denied',
  UNAUTHORIZED: 'Authentication required',
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_IN_USE: 'An account with this email already exists',
  USER_NOT_FOUND: 'User not found',
  REGISTER_SUCCESS: 'Registration successful. Please check your email to verify your account.',
  LOGIN_SUCCESS: 'Logged in successfully',
  LOGOUT_SUCCESS: 'Logged out successfully',
  TOKEN_REFRESHED: 'Token refreshed successfully',
  INVALID_TOKEN: 'Invalid or expired token',
  EMAIL_VERIFIED: 'Email verified successfully',
  EMAIL_ALREADY_VERIFIED: 'Email is already verified',
  VERIFICATION_SENT: 'Verification email sent',
  PASSWORD_RESET_SENT:
    'If an account with that email exists, a password reset link has been sent.',
  PASSWORD_RESET_SUCCESS: 'Password has been reset successfully',
  PROFILE_FETCHED: 'Profile fetched successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
});

export default {
  ROLES,
  PROVIDERS,
  TOKEN_TYPES,
  COOKIE_NAMES,
  HTTP_STATUS,
  MESSAGES,
};
