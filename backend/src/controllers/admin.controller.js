import userService from '../services/user.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import { HTTP_STATUS } from '../constants/index.js';

/** Admin-only user management controllers. */

export const listUsers = asyncHandler(async (req, res) => {
  const result = await userService.listUsers(req.query);
  return sendSuccess(res, HTTP_STATUS.OK, 'Users fetched successfully', result);
});

export const getUser = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  return sendSuccess(res, HTTP_STATUS.OK, 'User fetched successfully', { user });
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const user = await userService.updateUserRole(req.params.id, req.body.role);
  return sendSuccess(res, HTTP_STATUS.OK, 'User role updated successfully', { user });
});

export const deleteUser = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.params.id, req.user.id);
  return sendSuccess(res, HTTP_STATUS.OK, 'User deleted successfully');
});

export const getStats = asyncHandler(async (req, res) => {
  const stats = await userService.getStats();
  return sendSuccess(res, HTTP_STATUS.OK, 'Stats fetched successfully', { stats });
});

export default { listUsers, getUser, updateUserRole, deleteUser, getStats };
