import dotenv from 'dotenv';

dotenv.config();

/**
 * Centralized, validated application configuration.
 *
 * Reading process.env directly throughout the codebase is brittle and hard to
 * test. We parse everything here once, coerce types, apply sane defaults, and
 * fail fast on boot if a required secret is missing in production.
 */

const required = (key, value) => {
  if (value === undefined || value === null || value === '') {
    // In test we use in-memory mongo and dummy secrets, so don't hard-crash.
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }
  return value;
};

const toBool = (value, fallback = false) => {
  if (value === undefined) return fallback;
  return ['true', '1', 'yes', 'on'].includes(String(value).toLowerCase());
};

const config = {
  env: process.env.NODE_ENV || 'development',
  isProduction: (process.env.NODE_ENV || 'development') === 'production',
  isTest: process.env.NODE_ENV === 'test',

  port: parseInt(process.env.PORT || '5000', 10),
  apiPrefix: process.env.API_PREFIX || '/api',

  mongo: {
    uri: required('MONGODB_URI', process.env.MONGODB_URI) || 'mongodb://127.0.0.1:27017/mern_auth',
  },

  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

  jwt: {
    accessSecret: required('JWT_SECRET', process.env.JWT_SECRET) || 'dev_access_secret_change_me',
    refreshSecret:
      required('JWT_REFRESH_SECRET', process.env.JWT_REFRESH_SECRET) || 'dev_refresh_secret_change_me',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    // milliseconds used for cookie maxAge
    accessExpiresMs: 15 * 60 * 1000,
    refreshExpiresMs: 7 * 24 * 60 * 60 * 1000,
  },

  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10),
  },

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackUrl:
      process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
    enabled: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
  },

  smtp: {
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: toBool(process.env.SMTP_SECURE, false),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.EMAIL_FROM || 'No Reply <no-reply@mern-auth.dev>',
  },

  cookie: {
    // 'none' requires Secure=true and is needed for cross-site SPA + API.
    sameSite: process.env.COOKIE_SAME_SITE || 'lax',
    secure: toBool(process.env.COOKIE_SECURE, process.env.NODE_ENV === 'production'),
    domain: process.env.COOKIE_DOMAIN || undefined,
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || `${15 * 60 * 1000}`, 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    authMax: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '10', 10),
  },

  cors: {
    // Comma-separated list of allowed origins.
    origins: (process.env.CORS_ORIGINS || process.env.CLIENT_URL || 'http://localhost:5173')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean),
  },

  logLevel: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
};

export default config;
