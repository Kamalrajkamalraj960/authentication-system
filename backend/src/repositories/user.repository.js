import User from '../models/user.model.js';

/**
 * Data-access layer for the User collection.
 *
 * The repository is the ONLY place that talks to the Mongoose model. Services
 * depend on this abstraction (Dependency Inversion) which keeps business logic
 * free of query details and makes the service layer trivially mockable in tests.
 */
class UserRepository {
  create(data) {
    return User.create(data);
  }

  findById(id, { select } = {}) {
    const query = User.findById(id);
    if (select) query.select(select);
    return query.exec();
  }

  findByEmail(email, { withPassword = false } = {}) {
    const query = User.findOne({ email: String(email).toLowerCase() });
    if (withPassword) query.select('+password');
    return query.exec();
  }

  findByGoogleId(googleId) {
    return User.findOne({ googleId }).exec();
  }

  findOne(filter, { select } = {}) {
    const query = User.findOne(filter);
    if (select) query.select(select);
    return query.exec();
  }

  existsByEmail(email) {
    return User.exists({ email: String(email).toLowerCase() });
  }

  /** Generic save passthrough for documents already loaded by the service. */
  save(doc) {
    return doc.save();
  }

  updateById(id, update, options = { new: true }) {
    return User.findByIdAndUpdate(id, update, options).exec();
  }

  deleteById(id) {
    return User.findByIdAndDelete(id).exec();
  }

  /** Paginated listing for the admin dashboard. */
  async paginate({ page = 1, limit = 10, role, search, sort = '-createdAt' } = {}) {
    const filter = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Math.max(1, page) - 1) * limit;
    const [items, total] = await Promise.all([
      User.find(filter).sort(sort).skip(skip).limit(limit).exec(),
      User.countDocuments(filter).exec(),
    ]);

    return {
      items,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  count(filter = {}) {
    return User.countDocuments(filter).exec();
  }
}

export default new UserRepository();
