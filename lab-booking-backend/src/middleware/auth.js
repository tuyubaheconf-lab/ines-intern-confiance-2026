/**
 * JWT authentication middleware.
 * Verifies the Bearer token and attaches `req.user`.
 */
import { verifyToken } from '../utils/jwt.js';

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      data: null,
      error: { message: 'Authentication required. Provide a Bearer token.', statusCode: 401, details: null },
      meta: null,
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.id, email: payload.email, role: payload.role };
    next();
  } catch (err) {
    const message = err.name === 'TokenExpiredError' ? 'Token has expired' : 'Invalid token';
    return res.status(401).json({
      success: false,
      data: null,
      error: { message, statusCode: 401, details: null },
      meta: null,
    });
  }
}
