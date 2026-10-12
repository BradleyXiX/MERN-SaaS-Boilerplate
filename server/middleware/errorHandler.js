/**
 * RFC 7807 Problem Details Global Error Handler
 * Standardizes error responses across the entire API while supporting backward compatibility
 */

class AppError extends Error {
  constructor(message, statusCode, options = {}) {
    super(message);
    this.statusCode = statusCode || 500;
    this.type = options.type || `https://api.example.com/errors/http-${this.statusCode}`;
    this.title = options.title || getDefaultTitleForStatus(this.statusCode);
    this.detail = message;
    this.code = options.code;
    this.invalidParams = options.invalidParams;
    Error.captureStackTrace(this, this.constructor);
  }
}

function getDefaultTitleForStatus(status) {
  switch (status) {
    case 400: return 'Bad Request';
    case 401: return 'Unauthorized';
    case 403: return 'Forbidden';
    case 404: return 'Not Found';
    case 409: return 'Conflict';
    case 422: return 'Unprocessable Entity';
    case 429: return 'Too Many Requests';
    case 500: return 'Internal Server Error';
    default: return 'HTTP Error';
  }
}

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let type = err.type || `https://api.example.com/errors/http-${statusCode}`;
  let title = err.title || getDefaultTitleForStatus(statusCode);
  let detail = err.message || 'An unexpected error occurred.';
  let invalidParams = err.invalidParams;

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    type = 'https://api.example.com/errors/invalid-id';
    title = 'Bad Request';
    detail = `Invalid format for resource identifier: ${err.path}`;
  }

  // Handle Mongoose Duplicate Key Error (11000)
  if (err.code === 11000) {
    statusCode = 409;
    type = 'https://api.example.com/errors/duplicate-resource';
    title = 'Conflict';
    const field = Object.keys(err.keyPattern || {})[0] || 'resource';
    detail = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
  }

  // Handle JWT Verification Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    type = 'https://api.example.com/errors/invalid-token';
    title = 'Unauthorized';
    detail = 'Authentication token is invalid or malformed.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    type = 'https://api.example.com/errors/token-expired';
    title = 'Unauthorized';
    detail = 'Authentication token has expired. Please refresh your session.';
  }

  // Handle Express Validator legacy errors
  if (err.array && typeof err.array === 'function') {
    statusCode = 422;
    type = 'https://api.example.com/errors/validation-failed';
    title = 'Unprocessable Entity';
    const errors = err.array();
    detail = 'One or more request parameters failed validation.';
    invalidParams = errors.map((e) => ({ field: e.path || e.param, message: e.msg }));
  }

  const isProduction = process.env.NODE_ENV === 'production';

  // Set RFC 7807 Content-Type header if method exists
  if (typeof res.setHeader === 'function') {
    res.setHeader('Content-Type', 'application/problem+json');
  }

  // Response with RFC 7807 problem details + backward compatibility fields
  res.status(statusCode).json({
    // Standard RFC 7807 fields
    type,
    title,
    status: statusCode,
    detail,
    instance: req ? req.originalUrl : undefined,
    timestamp: new Date().toISOString(),
    ...(invalidParams && { invalidParams }),

    // Backward compatibility fields for legacy clients/tests
    success: false,
    statusCode,
    message: detail,
    ...(process.env.NODE_ENV === 'development' && {
      error: { message: detail, statusCode },
      stack: err.stack,
    }),
  });
};

const catchAsyncErrors = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  AppError,
  errorHandler,
  catchAsyncErrors,
};
