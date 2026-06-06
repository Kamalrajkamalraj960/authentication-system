import crypto from 'crypto';

/**
 * Helpers for generating one-time tokens (email verification, password reset).
 *
 * We send the raw token to the user but only persist its SHA-256 hash. If the
 * database leaks, the stored hashes cannot be used to forge a valid link.
 */

export const generateRawToken = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');

export const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

/**
 * Creates a {raw, hashed, expiresAt} triple for a one-time token.
 * @param {number} ttlMs - time-to-live in milliseconds.
 */
export const createOneTimeToken = (ttlMs) => {
  const raw = generateRawToken();
  return {
    raw,
    hashed: hashToken(raw),
    expiresAt: new Date(Date.now() + ttlMs),
  };
};

export default { generateRawToken, hashToken, createOneTimeToken };
