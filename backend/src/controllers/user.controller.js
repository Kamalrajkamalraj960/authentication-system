import userService from '../services/user.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import { HTTP_STATUS, MESSAGES } from '../constants/index.js';

/** Profile controllers for the authenticated user. */

export const getProfile = asyncHandler(async (req, res) => {
  const user = await userService.getProfile(req.user.id);
  return sendSuccess(res, HTTP_STATUS.OK, MESSAGES.PROFILE_FETCHED, { user });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user.id, req.body);
  return sendSuccess(res, HTTP_STATUS.OK, MESSAGES.PROFILE_UPDATED, { user });
});

export default { getProfile, updateProfile };
