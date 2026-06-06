import User from '../models/user.model.js';
import logger from '../utils/logger.js';

/**
 * Periodic maintenance job: prune expired refresh tokens and stale one-time
 * tokens from user documents. Keeps documents lean and removes dangling
 * credentials. Scheduled with a simple setInterval (swap for a real scheduler
 * such as Agenda/BullMQ/cron in a multi-instance deployment).
 */
export const cleanupExpiredTokens = async () => {
  const now = new Date();

  // Remove expired refresh-token subdocuments.
  const refreshResult = await User.updateMany(
    { 'refreshTokens.expiresAt': { $lte: now } },
    { $pull: { refreshTokens: { expiresAt: { $lte: now } } } }
  );

  // Clear expired email-verification / password-reset tokens.
  const otpResult = await User.updateMany(
    {
      $or: [
        { emailVerificationExpires: { $lte: now } },
        { passwordResetExpires: { $lte: now } },
      ],
    },
    {
      $unset: {
        emailVerificationToken: '',
        emailVerificationExpires: '',
        passwordResetToken: '',
        passwordResetExpires: '',
      },
    }
  );

  logger.info(
    `Token cleanup: refresh-modified=${refreshResult.modifiedCount}, otp-modified=${otpResult.modifiedCount}`
  );
};

let intervalRef = null;

export const startTokenCleanupJob = (intervalMs = 60 * 60 * 1000) => {
  if (intervalRef) return intervalRef;
  intervalRef = setInterval(() => {
    cleanupExpiredTokens().catch((err) => logger.error(`Token cleanup failed: ${err.message}`));
  }, intervalMs);
  // Don't keep the event loop alive solely for this timer.
  if (intervalRef.unref) intervalRef.unref();
  logger.info('Token cleanup job scheduled');
  return intervalRef;
};

export const stopTokenCleanupJob = () => {
  if (intervalRef) clearInterval(intervalRef);
  intervalRef = null;
};

export default { cleanupExpiredTokens, startTokenCleanupJob, stopTokenCleanupJob };
