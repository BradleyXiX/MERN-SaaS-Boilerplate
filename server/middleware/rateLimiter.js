const rateLimit = require('express-rate-limit');

// General API rate limiter (10 requests per 15 minutes per IP)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: 'Too many API requests from this IP, please try again later',
  standardHeaders: true, // Return rate limit info in the RateLimit-* headers
  legacyHeaders: false // Disable the X-RateLimit-* headers
});

// Auth-specific rate limiter (5 requests per 15 minutes per IP)
// Stricter for authentication endpoints to prevent brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later',
  skipFailedRequests: false, // Count failed requests
  standardHeaders: true,
  legacyHeaders: false
});

// Login-specific rate limiter (5 requests per 15 minutes per IP)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again later',
  skipFailedRequests: false,
  standardHeaders: true,
  legacyHeaders: false
});

// Password reset rate limiter (3 requests per 1 hour per IP)
// Very strict to prevent abuse
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: 'Too many password reset attempts, please try again after 1 hour',
  skipFailedRequests: true, // Only count successful requests to prevent enumeration
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  apiLimiter,
  authLimiter,
  loginLimiter,
  passwordResetLimiter
};
