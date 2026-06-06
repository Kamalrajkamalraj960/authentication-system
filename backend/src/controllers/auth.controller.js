import authService from '../services/auth.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import { setAuthCookies, clearAuthCookies } from '../utils/cookies.js';
import { COOKIE_NAMES, HTTP_STATUS, MESSAGES } from '../constants/index.js';
import config from '../config/index.js';

/**
 * HTTP controllers for authentication. Thin layer: translate req -> service
 * call -> response. All business rules live in the service.
 */

export const register = asyncHandler(async (req, res) => {
  const { user } = await authService.register(req.body);
  return sendSuccess(res, HTTP_STATUS.CREATED, MESSAGES.REGISTER_SUCCESS, { user });
});

export const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body);
  setAuthCookies(res, { accessToken, refreshToken });
  return sendSuccess(res, HTTP_STATUS.OK, MESSAGES.LOGIN_SUCCESS, { user, accessToken });
});

export const refresh = asyncHandler(async (req, res) => {
  const raw = req.cookies?.[COOKIE_NAMES.REFRESH_TOKEN] || req.body?.refreshToken;
  const { user, accessToken, refreshToken } = await authService.refresh(raw);
  setAuthCookies(res, { accessToken, refreshToken });
  return sendSuccess(res, HTTP_STATUS.OK, MESSAGES.TOKEN_REFRESHED, { user, accessToken });
});

export const logout = asyncHandler(async (req, res) => {
  const raw = req.cookies?.[COOKIE_NAMES.REFRESH_TOKEN];
  await authService.logout(req.user?.id, raw, { allDevices: Boolean(req.body?.allDevices) });
  clearAuthCookies(res);
  return sendSuccess(res, HTTP_STATUS.OK, MESSAGES.LOGOUT_SUCCESS);
});

export const verifyEmail = asyncHandler(async (req, res) => {
  await authService.verifyEmail(req.query.token);
  return sendSuccess(res, HTTP_STATUS.OK, MESSAGES.EMAIL_VERIFIED);
});

export const resendVerification = asyncHandler(async (req, res) => {
  await authService.resendVerification(req.body.email);
  return sendSuccess(res, HTTP_STATUS.OK, MESSAGES.VERIFICATION_SENT);
});

export const forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body.email);
  return sendSuccess(res, HTTP_STATUS.OK, MESSAGES.PASSWORD_RESET_SENT);
});

export const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body.token, req.body.password);
  clearAuthCookies(res);
  return sendSuccess(res, HTTP_STATUS.OK, MESSAGES.PASSWORD_RESET_SUCCESS);
});

/** Current authenticated user (used by the SPA to hydrate state on load). */
export const me = asyncHandler(async (req, res) => {
  return sendSuccess(res, HTTP_STATUS.OK, MESSAGES.PROFILE_FETCHED, { user: req.user });
});

/**
 * Google OAuth callback. Passport has attached req.user; we mint our own
 * session tokens and redirect the browser back to the SPA.
 */
export const googleCallback = asyncHandler(async (req, res) => {
  const { accessToken, refreshToken } = await authService.issueGoogleSession(req.user);
  setAuthCookies(res, { accessToken, refreshToken });
  // Pass the access token via fragment so the SPA can hydrate immediately.
  return res.redirect(`${config.clientUrl}/oauth/callback#token=${accessToken}`);
});

export default {
  register,
  login,
  refresh,
  logout,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  me,
  googleCallback,
};
