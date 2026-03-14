const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  logout
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const {
  handleValidationErrors,
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword
} = require('../middleware/validation');

router.post('/register', validateRegister, handleValidationErrors, registerUser);
router.post('/login', validateLogin, handleValidationErrors, loginUser);

// email verification & password tooling
router.get('/verify-email', verifyEmail);
router.post('/forgot-password', validateForgotPassword, handleValidationErrors, forgotPassword);
router.post('/reset-password', validateResetPassword, handleValidationErrors, resetPassword);

// protected routes
router.get('/me', protect, getCurrentUser);
router.post('/logout', protect, logout);

module.exports = router;
