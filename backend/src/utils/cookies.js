import config from '../config/index.js';
import { COOKIE_NAMES } from '../constants/index.js';

/**
 * Centralized secure-cookie management.
 *
 * - httpOnly: JS cannot read the token (mitigates XSS token theft)
 * - secure:   only over HTTPS in production
 * - sameSite: CSRF mitigation
 * - signed:   not used; tokens are JWTs (self-verifying)
 */
const baseOptions = () => ({
  httpOnly: true,
  secure: config.cookie.secure,
  sameSite: config.cookie.sameSite,
  domain: config.cookie.domain,
  path: '/',
});

export const setAuthCookies = (res, { accessToken, refreshToken }) => {
  if (accessToken) {
    res.cookie(COOKIE_NAMES.ACCESS_TOKEN, accessToken, {
      ...baseOptions(),
      maxAge: config.jwt.accessExpiresMs,
    });
  }
  if (refreshToken) {
    res.cookie(COOKIE_NAMES.REFRESH_TOKEN, refreshToken, {
      ...baseOptions(),
      // Scope the refresh cookie to the refresh endpoint to limit exposure.
      maxAge: config.jwt.refreshExpiresMs,
    });
  }
};

export const clearAuthCookies = (res) => {
  const opts = baseOptions();
  res.clearCookie(COOKIE_NAMES.ACCESS_TOKEN, opts);
  res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, opts);
};

export default { setAuthCookies, clearAuthCookies };
