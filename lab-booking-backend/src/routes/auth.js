/**
 * Auth routes.
 *
 * POST /api/v1/auth/login  — Login with email + password
 * POST /api/v1/auth/refresh — Refresh access token
 * GET  /api/v1/auth/me    — Get current user profile
 */
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import db from '../db/knex.js';
import { signAccessToken, signRefreshToken, verifyToken } from '../utils/jwt.js';
import { success, error } from '../utils/response.js';
import { loginSchema, refreshSchema } from '../schemas/auth.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { loginRateLimiter } from '../middleware/rateLimit.js';

const router = Router();

/**
 * POST /login
 * Rate-limited: 5 attempts per minute per IP.
 */
router.post('/login', loginRateLimiter, validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await db('users').where({ email }).first();
    if (!user) {
      return res.status(401).json(error('Invalid email or password', 401));
    }

    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) {
      return res.status(401).json(error('Invalid email or password', 401));
    }

    if (!user.is_active) {
      return res.status(403).json(error('Account is deactivated. Contact the administrator.', 403));
    }

    const tokenPayload = { id: user.id, email: user.email, role: user.role };
    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    // Store refresh token in DB
    await db('users').where({ id: user.id }).update({ refresh_token: refreshToken, updated_at: new Date() });

    return res.json(success({
      user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role },
      accessToken,
      refreshToken,
    }));
  } catch (err) {
    next(err);
  }
});

/**
 * POST /refresh
 * Exchange a refresh token for a new access token.
 */
router.post('/refresh', validate(refreshSchema), async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    let payload;
    try {
      payload = verifyToken(refreshToken);
    } catch {
      return res.status(401).json(error('Invalid or expired refresh token', 401));
    }

    const user = await db('users').where({ id: payload.id, refresh_token: refreshToken }).first();
    if (!user) {
      return res.status(401).json(error('Refresh token has been revoked', 401));
    }

    const tokenPayload = { id: user.id, email: user.email, role: user.role };
    const newAccessToken = signAccessToken(tokenPayload);
    const newRefreshToken = signRefreshToken(tokenPayload);

    await db('users').where({ id: user.id }).update({ refresh_token: newRefreshToken, updated_at: new Date() });

    return res.json(success({ accessToken: newAccessToken, refreshToken: newRefreshToken }));
  } catch (err) {
    next(err);
  }
});

/**
 * GET /me
 * Returns the authenticated user's profile.
 */
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await db('users')
      .select('id', 'email', 'full_name', 'role', 'is_active', 'created_at')
      .where({ id: req.user.id })
      .first();

    if (!user) {
      return res.status(404).json(error('User not found', 404));
    }

    return res.json(success({ user }));
  } catch (err) {
    next(err);
  }
});

export default router;
