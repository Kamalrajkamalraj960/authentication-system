import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import passport from 'passport';
import swaggerUi from 'swagger-ui-express';

import config from './config/index.js';
import { configurePassport } from './config/passport.js';
import swaggerSpec from './config/swagger.js';
import routes from './routes/index.js';
import { globalLimiter } from './middleware/rateLimiter.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import { morganStream } from './utils/logger.js';

/**
 * Builds and configures the Express application. Kept free of any
 * network/database side effects so it can be imported directly by Supertest.
 */
export const createApp = () => {
  const app = express();

  // Trust the first proxy (needed for secure cookies + correct client IPs
  // behind load balancers / reverse proxies).
  app.set('trust proxy', 1);

  // ---- Security middleware ----
  app.use(helmet());
  app.use(
    cors({
      origin(origin, callback) {
        // Allow same-origin / server-to-server (no Origin header).
        if (!origin) return callback(null, true);
        // Compare ignoring a trailing slash so `https://x.app` and `https://x.app/`
        // both match — the browser sends the Origin without a trailing slash.
        const normalize = (o) => o.replace(/\/+$/, '');
        const allowed = config.cors.origins.map(normalize);
        if (allowed.includes(normalize(origin))) return callback(null, true);
        // Reject cleanly: no CORS headers (browser blocks) without a 500 / stack leak.
        return callback(null, false);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    })
  );

  // ---- Body parsing & cookies ----
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));
  app.use(cookieParser());

  // ---- Sanitization (NoSQL injection, HTTP param pollution) ----
  app.use(mongoSanitize());
  app.use(hpp());

  // ---- Performance & logging ----
  app.use(compression());
  if (!config.isTest) app.use(morgan(config.isProduction ? 'combined' : 'dev', { stream: morganStream }));

  // ---- Passport (stateless; sessions disabled) ----
  configurePassport();
  app.use(passport.initialize());

  // ---- Rate limiting (global) ----
  app.use(config.apiPrefix, globalLimiter);

  // ---- API docs ----
  app.use(
    `${config.apiPrefix}/docs`,
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, { customSiteTitle: 'MERN Auth API Docs' })
  );
  app.get(`${config.apiPrefix}/docs.json`, (_req, res) => res.json(swaggerSpec));

  // ---- API routes ----
  app.use(config.apiPrefix, routes);

  app.get('/', (_req, res) =>
    res.json({ success: true, message: 'MERN Auth API', data: { docs: `${config.apiPrefix}/docs` } })
  );

  // ---- 404 + centralized error handling ----
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

export default createApp;
