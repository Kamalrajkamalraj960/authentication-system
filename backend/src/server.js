import { createApp } from './app.js';
import config from './config/index.js';
import connectDatabase, { disconnectDatabase } from './config/database.js';
import { startTokenCleanupJob, stopTokenCleanupJob } from './jobs/tokenCleanup.job.js';
import logger from './utils/logger.js';

/**
 * Process entry point. Connects to MongoDB, starts the HTTP server, schedules
 * background jobs, and wires up graceful shutdown + last-resort crash handlers.
 */
const start = async () => {
  try {
    await connectDatabase();

    const app = createApp();
    const server = app.listen(config.port, () => {
      logger.info(`Server running in ${config.env} mode on port ${config.port}`);
      logger.info(`API docs: http://localhost:${config.port}${config.apiPrefix}/docs`);
    });

    startTokenCleanupJob();

    const shutdown = async (signal) => {
      logger.warn(`${signal} received. Shutting down gracefully...`);
      stopTokenCleanupJob();
      server.close(async () => {
        await disconnectDatabase();
        logger.info('Shutdown complete');
        process.exit(0);
      });
      // Force-exit if cleanup hangs.
      setTimeout(() => process.exit(1), 10000).unref();
    };

    ['SIGINT', 'SIGTERM'].forEach((sig) => process.on(sig, () => shutdown(sig)));

    process.on('unhandledRejection', (reason) => {
      logger.error(`Unhandled Rejection: ${reason}`);
    });
    process.on('uncaughtException', (err) => {
      logger.error(`Uncaught Exception: ${err.message}\n${err.stack}`);
      process.exit(1);
    });
  } catch (err) {
    logger.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  }
};

start();
