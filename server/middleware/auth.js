const jwt = require('jsonwebtoken');
const { AUTH_COOKIE_NAME } = require('../utils/cookieHelper');
const { AppError } = require('./errorHandler');

/**
 * Authentication extraction middleware.
 * Inspects both HttpOnly cookies and Bearer headers for seamless backward compatibility.
 */
exports.protect = (req, res, next) => {
  let token = null;

  // 1. Inspect HttpOnly Cookie (Primary & Secure)
  if (req.cookies && req.cookies[AUTH_COOKIE_NAME]) {
    token = req.cookies[AUTH_COOKIE_NAME];
  }
  // 2. Fallback to Authorization Header (Bearer token for CLI / API integrations)
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('Authentication credentials are required to access this resource.', 401, {
        type: 'https://api.example.com/errors/unauthorized',
        title: 'Unauthorized',
      })
    );
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return next(
      new AppError('Authentication token is invalid or expired.', 401, {
        type: 'https://api.example.com/errors/invalid-token',
        title: 'Unauthorized',
      })
    );
  }
};

/**
 * Role-Based Access Control (RBAC) middleware generator.
 * Asserts authenticated user has at least one of the specified roles.
 */
exports.requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(
        new AppError('Authentication required.', 401, {
          type: 'https://api.example.com/errors/unauthorized',
          title: 'Unauthorized',
        })
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(`Role '${req.user.role}' lacks sufficient privileges for this operation.`, 403, {
          type: 'https://api.example.com/errors/forbidden',
          title: 'Forbidden',
        })
      );
    }

    next();
  };
};

// Backward compatibility alias
exports.adminOnly = exports.requireRole('admin', 'super_admin');