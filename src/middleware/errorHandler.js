import config from '../config/env.js';

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  const response = {
    status: 'error',
    statusCode,
    message,
    ...(config.isDevelopment && { stack: err.stack }),
  };

  // Log the error for servers
  if (config.isProduction) {
    console.error(`[Error] ${statusCode} - ${message}`);
  } else {
    console.error(err);
  }

  res.status(statusCode).json(response);
};

// Middleware to catch 404 routes
export const notFoundHandler = (req, res, next) => {
  const error = new Error(`Resource not found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};
