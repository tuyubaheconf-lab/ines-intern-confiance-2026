/**
 * Rate limiting middleware for login endpoint.
 * Limits to 5 requests per minute per IP.
 */
import rateLimit from 'express-rate-limit';
import config from '../config/index.js';

export const loginRateLimiter = rateLimit({
  windowMs: config.rateLimit.login.windowMs,
  max: config.rateLimit.login.max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      data: null,
      error: { message: 'Too many login attempts. Please try again later.', statusCode: 429, details: null },
      meta: null,
    });
  },
});
