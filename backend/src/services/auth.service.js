import userRepository from '../repositories/user.repository.js';
import tokenService from './token.service.js';
import emailService from './email.service.js';
import ApiError from '../utils/ApiError.js';
import { hashToken, createOneTimeToken } from '../utils/crypto.js';
import { MESSAGES, PROVIDERS, ROLES } from '../constants/index.js';
import config from '../config/index.js';
import logger from '../utils/logger.js';

const EMAIL_VERIFY_TTL = 24 * 60 * 60 * 1000; // 24h
const PASSWORD_RESET_TTL = 60 * 60 * 1000; // 1h
const MAX_REFRESH_SESSIONS = 5; // cap concurrent device sessions

/**
 * Authentication business logic. Orchestrates the repository, token service,
 * and email service. Knows nothing about HTTP — controllers translate its
 * results/exceptions into responses.
 */
class AuthService {
  /** Register a new local user and dispatch a verification email. */
  async register({ name, email, password }) {
    const exists = await userRepository.existsByEmail(email);
    if (exists) throw ApiError.conflict(MESSAGES.EMAIL_IN_USE);

    const { raw, hashed, expiresAt } = createOneTimeToken(EMAIL_VERIFY_TTL);

    const user = await userRepository.create({
      name,
      email,
      password,
      provider: PROVIDERS.LOCAL,
      emailVerificationToken: hashed,
      emailVerificationExpires: expiresAt,
    });

    // Email sending must never break the registration transaction.
    emailService
      .sendVerificationEmail({ to: user.email, name: user.name, token: raw })
      .catch((err) => logger.error(`Verification email failed: ${err.message}`));

    return { user };
  }

  /** Validate credentials and issue a token pair. */
  async login({ email, password }) {
    const user = await userRepository.findByEmail(email, { withPassword: true });
    if (!user) throw ApiError.unauthorized(MESSAGES.INVALID_CREDENTIALS);

    if (user.provider !== PROVIDERS.LOCAL && !user.password) {
      throw ApiError.badRequest(
        `This account uses ${user.provider} sign-in. Please continue with ${user.provider}.`
      );
    }

    const valid = await user.comparePassword(password);
    if (!valid) throw ApiError.unauthorized(MESSAGES.INVALID_CREDENTIALS);

    const tokens = await this.issueSession(user);
    return { user, ...tokens };
  }

  /**
   * Create a session: sign tokens, persist the refresh-token hash, update login
   * stats. Trims oldest sessions beyond the device cap.
   */
  async issueSession(user) {
    const tokens = tokenService.generateAuthTokens(user);

    const doc = await userRepository.findById(user.id, { select: '+refreshTokens' });
    doc.refreshTokens.push(tokenService.buildRefreshRecord(tokens.refreshToken));

    // Drop expired + over-cap sessions (keep most recent).
    const now = Date.now();
    doc.refreshTokens = doc.refreshTokens
      .filter((rt) => rt.expiresAt.getTime() > now)
      .slice(-MAX_REFRESH_SESSIONS);

    doc.lastLogin = new Date();
    doc.loginCount += 1;
    await doc.save();

    return tokens;
  }

  /**
   * Rotate a refresh token: verify it, ensure it is still in the user's active
   * set, then replace it with a freshly minted one (one-time-use rotation).
   * Reuse of an already-rotated token revokes ALL sessions (theft detection).
   */
  async refresh(rawRefreshToken) {
    if (!rawRefreshToken) throw ApiError.unauthorized(MESSAGES.INVALID_TOKEN);

    const payload = tokenService.verifyRefreshToken(rawRefreshToken);
    const user = await userRepository.findById(payload.sub, { select: '+refreshTokens' });
    if (!user) throw ApiError.unauthorized(MESSAGES.INVALID_TOKEN);

    const incomingHash = hashToken(rawRefreshToken);
    const match = user.refreshTokens.find((rt) => rt.token === incomingHash);

    if (!match) {
      // Token validly signed but not in active set => it was already rotated
      // (potential replay/theft). Nuke every session for safety.
      user.refreshTokens = [];
      await user.save();
      throw ApiError.unauthorized('Refresh token reuse detected. Please log in again.');
    }

    // Rotation: remove the used token, mint a new pair, store the new hash.
    user.refreshTokens = user.refreshTokens.filter((rt) => rt.token !== incomingHash);
    const tokens = tokenService.generateAuthTokens(user);
    user.refreshTokens.push(tokenService.buildRefreshRecord(tokens.refreshToken));
    await user.save();

    return { user, ...tokens };
  }

  /** Revoke a single session (logout) or all sessions (logout everywhere). */
  async logout(userId, rawRefreshToken, { allDevices = false } = {}) {
    if (!userId) return;
    const user = await userRepository.findById(userId, { select: '+refreshTokens' });
    if (!user) return;

    if (allDevices || !rawRefreshToken) {
      user.refreshTokens = [];
    } else {
      const hash = hashToken(rawRefreshToken);
      user.refreshTokens = user.refreshTokens.filter((rt) => rt.token !== hash);
    }
    await user.save();
  }

  /** Verify an email-verification token. Idempotent-ish & safe. */
  async verifyEmail(rawToken) {
    if (!rawToken) throw ApiError.badRequest(MESSAGES.INVALID_TOKEN);

    const hashed = hashToken(rawToken);
    const user = await userRepository.findOne(
      { emailVerificationToken: hashed, emailVerificationExpires: { $gt: new Date() } },
      { select: '+emailVerificationToken +emailVerificationExpires' }
    );
    if (!user) throw ApiError.badRequest(MESSAGES.INVALID_TOKEN);

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    emailService
      .sendWelcomeEmail({ to: user.email, name: user.name })
      .catch((err) => logger.error(`Welcome email failed: ${err.message}`));

    return { user };
  }

  /** (Re)send a verification email. */
  async resendVerification(email) {
    const user = await userRepository.findByEmail(email);
    // Do not leak which emails exist.
    if (!user || user.isEmailVerified) return;

    const { raw, hashed, expiresAt } = createOneTimeToken(EMAIL_VERIFY_TTL);
    user.emailVerificationToken = hashed;
    user.emailVerificationExpires = expiresAt;
    await user.save();

    await emailService.sendVerificationEmail({ to: user.email, name: user.name, token: raw });
  }

  /** Begin password reset. Always returns success to avoid user enumeration. */
  async forgotPassword(email) {
    const user = await userRepository.findByEmail(email);
    if (!user || user.provider !== PROVIDERS.LOCAL) return;

    const { raw, hashed, expiresAt } = createOneTimeToken(PASSWORD_RESET_TTL);
    user.passwordResetToken = hashed;
    user.passwordResetExpires = expiresAt;
    await user.save();

    await emailService.sendPasswordResetEmail({ to: user.email, name: user.name, token: raw });
  }

  /** Complete password reset and revoke all existing sessions. */
  async resetPassword(rawToken, newPassword) {
    if (!rawToken) throw ApiError.badRequest(MESSAGES.INVALID_TOKEN);

    const hashed = hashToken(rawToken);
    const user = await userRepository.findOne(
      { passwordResetToken: hashed, passwordResetExpires: { $gt: new Date() } },
      { select: '+passwordResetToken +passwordResetExpires +refreshTokens' }
    );
    if (!user) throw ApiError.badRequest(MESSAGES.INVALID_TOKEN);

    user.password = newPassword; // re-hashed by pre-save hook
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshTokens = []; // force re-login on all devices
    await user.save();

    return { user };
  }

  /**
   * Find-or-create flow for Google OAuth. Links to an existing local account by
   * email (account linking) or provisions a new verified user.
   */
  async handleGoogleProfile(profile) {
    const email = profile.emails?.[0]?.value?.toLowerCase();
    const googleId = profile.id;
    const name = profile.displayName || email?.split('@')[0] || 'User';
    const picture = profile.photos?.[0]?.value || '';

    if (!email) throw ApiError.badRequest('Google account has no email');

    let user = await userRepository.findByGoogleId(googleId);
    if (user) return user;

    user = await userRepository.findByEmail(email);
    if (user) {
      // Link Google to the existing account.
      user.googleId = googleId;
      user.provider = user.provider === PROVIDERS.LOCAL ? PROVIDERS.GOOGLE : user.provider;
      user.isEmailVerified = true;
      if (!user.profilePicture && picture) user.profilePicture = picture;
      await user.save();
      return user;
    }

    return userRepository.create({
      name,
      email,
      googleId,
      provider: PROVIDERS.GOOGLE,
      profilePicture: picture,
      isEmailVerified: true,
      role: ROLES.USER,
    });
  }

  /** Convenience used by the OAuth callback controller. */
  async issueGoogleSession(user) {
    return this.issueSession(user);
  }

  get config() {
    return config;
  }
}

export default new AuthService();
