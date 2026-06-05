/**
 * Role-based access control middleware.
 * Checks that req.user.role is in the allowed roles list.
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        data: null,
        error: { message: 'Authentication required', statusCode: 401, details: null },
        meta: null,
      });
    }

    // Admin role has unrestricted access
    if (req.user.role === 'admin') {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        data: null,
        error: { message: `Access denied. Required role(s): ${allowedRoles.join(', ')}`, statusCode: 403, details: null },
        meta: null,
      });
    }

    next();
  };
}
