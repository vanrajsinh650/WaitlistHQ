import rateLimit from 'express-rate-limit';
import config from '../config/env.js';
import logger from '../utils/logger.js';

// Global API Rate Limiter
export const globalLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  standardHeaders: true, // Return rate limit info in the standard headers
  legacyHeaders: false, // Disable the legacy X-RateLimit-* headers
  handler: (req, res, next, options) => {
    logger.warn(`[Rate Limit Alert] Global limit exceeded by IP: ${req.ip} | Path: ${req.originalUrl}`);
    res.status(options.statusCode).json({
      error: options.message.error
    });
  },
  message: {
    error: 'Too many requests, please try again later.'
  }
});

// Stricter rate limiter for subscriber registration to prevent bot spam
export const registrationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 10, // Limit each IP to 10 subscriber additions per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    logger.warn(`[Rate Limit Alert] Registration limit exceeded by IP: ${req.ip}`);
    res.status(options.statusCode).json({
      error: options.message.error
    });
  },
  message: {
    error: 'Too many registration attempts. Please wait a minute before trying again.'
  }
});
