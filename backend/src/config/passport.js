import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import config from './index.js';
import authService from '../services/auth.service.js';
import logger from '../utils/logger.js';

/**
 * Passport configuration for Google OAuth 2.0.
 *
 * We use Passport ONLY to complete the OAuth handshake and obtain a verified
 * profile. We do NOT use sessions (session: false everywhere) — once we have
 * the profile we mint our own stateless JWTs, keeping the auth model uniform
 * with the local strategy. The strategy is only registered when credentials
 * are configured so the app still boots without Google set up.
 */
export const configurePassport = () => {
  if (!config.google.enabled) {
    logger.warn('Google OAuth disabled (GOOGLE_CLIENT_ID/SECRET not set)');
    return passport;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: config.google.clientId,
        clientSecret: config.google.clientSecret,
        callbackURL: config.google.callbackUrl,
        scope: ['profile', 'email'],
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const user = await authService.handleGoogleProfile(profile);
          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );

  logger.info('Google OAuth strategy configured');
  return passport;
};

export default configurePassport;
