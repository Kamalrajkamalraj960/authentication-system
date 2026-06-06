import userRepository from '../repositories/user.repository.js';
import ApiError from '../utils/ApiError.js';
import { MESSAGES } from '../constants/index.js';

/**
 * User-profile and admin user-management business logic.
 */
class UserService {
  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) throw ApiError.notFound(MESSAGES.USER_NOT_FOUND);
    return user;
  }

  async updateProfile(userId, { name, profilePicture }) {
    const update = {};
    if (name !== undefined) update.name = name;
    if (profilePicture !== undefined) update.profilePicture = profilePicture;

    const user = await userRepository.updateById(userId, update, {
      new: true,
      runValidators: true,
    });
    if (!user) throw ApiError.notFound(MESSAGES.USER_NOT_FOUND);
    return user;
  }

  // ---- Admin operations ----

  listUsers(query) {
    return userRepository.paginate(query);
  }

  async getUserById(id) {
    const user = await userRepository.findById(id);
    if (!user) throw ApiError.notFound(MESSAGES.USER_NOT_FOUND);
    return user;
  }

  async updateUserRole(id, role) {
    const user = await userRepository.updateById(id, { role }, { new: true, runValidators: true });
    if (!user) throw ApiError.notFound(MESSAGES.USER_NOT_FOUND);
    return user;
  }

  async deleteUser(id, requesterId) {
    if (String(id) === String(requesterId)) {
      throw ApiError.badRequest('You cannot delete your own admin account');
    }
    const user = await userRepository.deleteById(id);
    if (!user) throw ApiError.notFound(MESSAGES.USER_NOT_FOUND);
    return user;
  }

  async getStats() {
    const [total, admins, verified, google] = await Promise.all([
      userRepository.count({}),
      userRepository.count({ role: 'admin' }),
      userRepository.count({ isEmailVerified: true }),
      userRepository.count({ provider: 'google' }),
    ]);
    return { total, admins, users: total - admins, verified, google };
  }
}

export default new UserService();
