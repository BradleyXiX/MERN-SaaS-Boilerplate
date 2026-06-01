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
  refreshAccessToken
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const {
  handleValidationErrors,
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword
} = require('../middleware/validation');
const {
  authLimiter,
  loginLimiter,
  passwordResetLimiter
} = require('../middleware/rateLimiter');

router.post('/register', authLimiter, validateRegister, handleValidationErrors, registerUser);
router.post('/login', loginLimiter, validateLogin, handleValidationErrors, loginUser);

// Refresh token endpoint (no rate limit, no auth required)
router.post('/refresh-token', refreshAccessToken);

// email verification & password tooling
router.get('/verify-email', verifyEmail);
router.post('/forgot-password', passwordResetLimiter, validateForgotPassword, handleValidationErrors, forgotPassword);
router.post('/reset-password', passwordResetLimiter, validateResetPassword, handleValidationErrors, resetPassword);

// protected routes
router.get('/me', protect, getCurrentUser);
router.post('/logout', protect, logout);

module.exports = router;
