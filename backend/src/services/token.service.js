import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import { TOKEN_TYPES } from '../constants/index.js';
import { hashToken } from '../utils/crypto.js';
import ApiError from '../utils/ApiError.js';

/**
 * Stateless JWT issuing + stateful refresh-token bookkeeping.
 *
 * Access tokens are short-lived (15m) and verified purely by signature.
 * Refresh tokens are long-lived (7d), stored (as hashes) on the user document,
 * and support rotation + revocation so a stolen refresh token can be killed.
 */
class TokenService {
  signAccessToken(user) {
    return jwt.sign(
      { sub: user.id, role: user.role, type: TOKEN_TYPES.ACCESS },
      config.jwt.accessSecret,
      { expiresIn: config.jwt.accessExpiresIn }
    );
  }

  signRefreshToken(user) {
    return jwt.sign(
      { sub: user.id, type: TOKEN_TYPES.REFRESH },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiresIn }
    );
  }

  verifyAccessToken(token) {
    try {
      return jwt.verify(token, config.jwt.accessSecret);
    } catch {
      throw ApiError.unauthorized('Invalid or expired access token');
    }
  }

  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, config.jwt.refreshSecret);
    } catch {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }
  }

  /** Issue a fresh access+refresh pair for a user. */
  generateAuthTokens(user) {
    return {
      accessToken: this.signAccessToken(user),
      refreshToken: this.signRefreshToken(user),
    };
  }

  /** Refresh-token records are stored as SHA-256 hashes, never plaintext. */
  buildRefreshRecord(rawRefreshToken) {
    return {
      token: hashToken(rawRefreshToken),
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + config.jwt.refreshExpiresMs),
    };
  }

  matchesStored(rawRefreshToken, storedHash) {
    return hashToken(rawRefreshToken) === storedHash;
  }
}

export default new TokenService();
