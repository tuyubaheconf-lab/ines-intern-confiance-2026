/**
 * Centralized error handler.
 * Catches all errors and returns a standardized error response.
 * Never leaks stack traces to the client except in development.
 */
import config from '../config/index.js';

export function errorHandler(err, _req, res, _next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  // Log the error server-side
  console.error(`[ERROR] ${statusCode} - ${message}`, err.stack || '');

  res.status(statusCode).json({
    success: false,
    data: null,
    error: {
      message,
      statusCode,
      details: config.isDev && err.details ? err.details : null,
    },
    meta: null,
  });
}
