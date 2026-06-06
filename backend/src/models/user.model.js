import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import config from '../config/index.js';
import { ROLES, PROVIDERS } from '../constants/index.js';

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email'],
    },
    password: {
      // Not required for OAuth users (provider === 'google').
      type: String,
      minlength: [8, 'Password must be at least 8 characters'],
      // Never returned by default; explicitly select('+password') when needed.
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.USER,
      index: true,
    },
    provider: {
      type: String,
      enum: Object.values(PROVIDERS),
      default: PROVIDERS.LOCAL,
    },
    googleId: {
      type: String,
      index: true,
      sparse: true,
    },
    profilePicture: {
      type: String,
      default: '',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    // We store hashes of the refresh tokens currently valid for this user.
    // Supports multi-device sessions + rotation + revocation.
    refreshTokens: {
      type: [
        {
          token: { type: String, required: true },
          createdAt: { type: Date, default: Date.now },
          expiresAt: { type: Date, required: true },
        },
      ],
      default: [],
      select: false,
    },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
    passwordChangedAt: { type: Date, select: false },
    lastLogin: { type: Date },
    loginCount: { type: Number, default: 0 },
  },
  {
    timestamps: true, // createdAt, updatedAt
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        delete ret.password;
        delete ret.refreshTokens;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        delete ret.emailVerificationToken;
        delete ret.emailVerificationExpires;
        delete ret.passwordChangedAt;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound index to accelerate admin listing / sorting by recency.
userSchema.index({ role: 1, createdAt: -1 });
userSchema.index({ createdAt: -1 });

/**
 * Hash the password whenever it is set/changed. Runs before validation-less
 * saves too because we only act when the path is modified.
 */
userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password') || !this.password) return next();
  try {
    const salt = await bcrypt.genSalt(config.bcrypt.saltRounds);
    this.password = await bcrypt.hash(this.password, salt);
    // Subtract 1s to ensure token-issued-after-change comparisons are robust
    // against clock skew between hashing and JWT signing.
    if (!this.isNew) this.passwordChangedAt = new Date(Date.now() - 1000);
    return next();
  } catch (err) {
    return next(err);
  }
});

/** Compare a plaintext candidate against the stored hash. */
userSchema.methods.comparePassword = function comparePassword(candidate) {
  if (!this.password) return Promise.resolve(false);
  return bcrypt.compare(candidate, this.password);
};

/** Returns true if the password changed after the given JWT iat (seconds). */
userSchema.methods.passwordChangedAfter = function passwordChangedAfter(jwtIatSeconds) {
  if (!this.passwordChangedAt) return false;
  const changedAtSeconds = Math.floor(this.passwordChangedAt.getTime() / 1000);
  return jwtIatSeconds < changedAtSeconds;
};

const User = mongoose.model('User', userSchema);

export default User;
