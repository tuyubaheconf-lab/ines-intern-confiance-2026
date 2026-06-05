/**
 * Structured request logging middleware (using pino).
 */
import pino from 'pino';
import config from '../config/index.js';

const transport = config.isDev
  ? { target: 'pino-pretty', options: { colorize: true } }
  : undefined;

const logger = pino({ level: config.isDev ? 'info' : 'warn', transport });

/**
 * Log every request: method, path, status, duration, user id.
 */
export function requestLogger(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      userId: req.user?.id || 'anonymous',
    });
  });

  next();
}

export default logger;
