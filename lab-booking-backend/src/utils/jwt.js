import jwt from 'jsonwebtoken';
import config from '../config/index.js';

/**
 * Sign an access token (short-lived).
 */
export function signAccessToken(payload) {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.accessExpiresIn,
  });
}

/**
 * Sign a refresh token (long-lived).
 */
export function signRefreshToken(payload) {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });
}

/**
 * Verify a JWT token.
 * Returns { payload } on success, or throws on error.
 */
export function verifyToken(token) {
  return jwt.verify(token, config.jwt.secret);
}
