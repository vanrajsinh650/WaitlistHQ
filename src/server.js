import app from './app.js';
import config from './config/env.js';

const server = app.listen(config.port, () => {
  console.log(`=========================================`);
  console.log(`  Server is running in ${config.nodeEnv} mode`);
  console.log(`  Listening at http://localhost:${config.port}`);
  console.log(`=========================================`);
});

// Graceful Shutdown Handler
const shutdown = (signal) => {
  console.log(`\nReceived ${signal}. Starting graceful shutdown...`);
  
  server.close(() => {
    console.log('HTTP server closed.');
    // Close other resources (e.g. db) here
    process.exit(0);
  });

  // Force close after 10s if shutdown hangs
  setTimeout(() => {
    console.error('Forced shutdown due to timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err);
  process.exit(1);
});

// Unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION! Shutting down...');
  console.error(reason);
  process.exit(1);
});
