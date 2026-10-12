const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  logout,
  refreshAccessToken,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const {
  validateRequest,
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} = require('../middleware/zodValidator');
const {
  authLimiter,
  loginLimiter,
  passwordResetLimiter,
} = require('../middleware/rateLimiter');

// Registration & Login with Zod schema validation & sliding window rate limits
router.post(
  '/register',
  authLimiter,
  validateRequest({ body: registerSchema }),
  registerUser
);

router.post(
  '/login',
  loginLimiter,
  validateRequest({ body: loginSchema }),
  loginUser
);

// Token Refresh endpoint (supports cookie and body refresh token)
router.post('/refresh-token', refreshAccessToken);

// Email verification & Password recovery with Zod validation
router.get(
  '/verify-email',
  validateRequest({ query: verifyEmailSchema }),
  verifyEmail
);

router.post(
  '/forgot-password',
  passwordResetLimiter,
  validateRequest({ body: forgotPasswordSchema }),
  forgotPassword
);

router.post(
  '/reset-password',
  passwordResetLimiter,
  validateRequest({ body: resetPasswordSchema }),
  resetPassword
);

// Protected session routes
router.get('/me', protect, getCurrentUser);
router.post('/logout', logout);

module.exports = router;
