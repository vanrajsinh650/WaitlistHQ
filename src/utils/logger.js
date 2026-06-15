import winston from 'winston';
import config from '../config/env.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for console output
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// Define global format for log aggregation
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }), // Capture and format stack traces
  winston.format.json() // Output JSON format for files
);

// Colorized console format for development readability
const consoleFormat = winston.format.combine(
  winston.format.printf(
    (info) => `[${info.timestamp}] [${info.level.toUpperCase()}]: ${info.message}${info.stack ? `\n${info.stack}` : ''}`
  )
);

// Resolve logs directory path to WaitlistHQ/logs
const logDir = path.resolve(__dirname, '../../logs');

// Define logging transports
const transports = [
  // Output warnings/errors to logs/error.log
  new winston.transports.File({
    filename: path.join(logDir, 'error.log'),
    level: 'error',
  }),
  // Output all log levels to logs/combined.log
  new winston.transports.File({
    filename: path.join(logDir, 'combined.log'),
  }),
];

// If not in production, log colorized output to console
if (!config.isProduction) {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        consoleFormat
      ),
    })
  );
} else {
  // In production, also log JSON format to console for log aggregation tools
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  );
}

// Create and export logger instance
export const logger = winston.createLogger({
  level: config.logLevel || 'info',
  levels,
  format,
  transports,
});

export default logger;
