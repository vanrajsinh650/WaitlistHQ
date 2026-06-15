import app from './app.js';
import config from './config/env.js';
import logger from './utils/logger.js';
import './services/schedulerService.js'; // Start background campaign processing scheduler

const server = app.listen(config.port, () => {
  logger.info(`=========================================`);
  logger.info(`Server is running in ${config.nodeEnv} mode`);
  logger.info(`Listening at http://localhost:${config.port}`);
  logger.info(`=========================================`);
});

// Graceful Shutdown Handler
const shutdown = (signal) => {
  logger.warn(`Received ${signal}. Starting graceful shutdown...`);
  
  server.close(() => {
    logger.info('HTTP server closed.');
    process.exit(0);
  });

  // Force close after 10s if shutdown hangs
  setTimeout(() => {
    logger.error('Forced shutdown due to timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down...', err);
  process.exit(1);
});

// Unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('UNHANDLED REJECTION! Shutting down...', new Error(reason));
  process.exit(1);
});
