import config from '../config/env.js';
import logger from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  const response = {
    error: message, // Standard error payload pattern returning { "error": "..." }
    ...(config.isDevelopment && { stack: err.stack }),
  };

  // Log structured server error
  logger.error(`[Server Error] ${statusCode} - ${message} | Route: ${req.method} ${req.originalUrl}`, err);

  res.status(statusCode).json(response);
};

// Middleware to catch 404 routes
export const notFoundHandler = (req, res, next) => {
  const error = new Error(`Resource not found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};
