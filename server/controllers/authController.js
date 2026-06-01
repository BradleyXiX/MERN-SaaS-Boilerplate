const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const mailer = require('../utils/mailer');
const { generateTokenPair, verifyRefreshToken, hashToken, getTokenExpiry } = require('../utils/tokenService');
const verificationEmailTemplate = require('../utils/templates/verificationEmail');
const resetPasswordEmailTemplate = require('../utils/templates/resetPasswordEmail');
const { AppError, catchAsyncErrors } = require('../middleware/errorHandler');

// Register User
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('User already exists with this email', 400));
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const verificationToken = crypto.randomBytes(20).toString('hex');

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    verificationToken
  });

  // send verification email
  const verifyUrl = `${req.protocol}://${req.get('host')}/api/auth/verify-email?token=${verificationToken}`;
  await mailer.sendMail({
    to: email,
    subject: 'Verify Your Email Address',
    text: `Click this link to verify your account: ${verifyUrl}`,
    html: verificationEmailTemplate(verifyUrl)
  });

  res.status(201).json({
    success: true,
    message: 'User registered successfully. Please check your email to verify your account.'
  });
});

// Email verification handler
exports.verifyEmail = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.query;

  if (!token) {
    return next(new AppError('Verification token is required', 400));
  }

  const user = await User.findOne({ verificationToken: token });
  if (!user) {
    return next(new AppError('Invalid or expired verification token', 400));
  }

  user.verified = true;
  user.verificationToken = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Email verified successfully'
  });
});

// Initiate password reset
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError('Email is required', 400));
  }

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError('User not found with this email', 404));
  }

  const token = crypto.randomBytes(20).toString('hex');
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 3600000; // 1h
  await user.save();

  const resetUrl = `${req.protocol}://${req.get('host')}/reset-password?token=${token}`;
  await mailer.sendMail({
    to: email,
    subject: 'Reset Your Password',
    text: `You requested a password reset. Click here to set a new password: ${resetUrl}`,
    html: resetPasswordEmailTemplate(resetUrl)
  });

  res.status(200).json({
    success: true,
    message: 'Password reset email sent successfully'
  });
});

// Complete password reset
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return next(new AppError('Token and password are required', 400));
  }

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    return next(new AppError('Invalid or expired reset token', 400));
  }

  user.password = await bcrypt.hash(password, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password has been reset successfully'
  });
});

// Login User
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Email and password are required', 400));
  }

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError('Invalid credentials', 401));
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return next(new AppError('Invalid credentials', 401));
  }

  if (!user.verified) {
    return next(new AppError('Please verify your email before logging in', 403));
  }

  // Generate token pair
  const { accessToken, refreshToken, refreshTokenExpiry } = generateTokenPair(user._id);

  // Store refresh token in database (hashed for security)
  user.refreshTokens.push({
    token: hashToken(refreshToken),
    expiresAt: refreshTokenExpiry
  });

  // Clean up expired refresh tokens
  user.refreshTokens = user.refreshTokens.filter(rt => new Date(rt.expiresAt) > new Date());
  await user.save();

  res.status(200).json({
    success: true,
    data: {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    }
  });
});

// Get current user (protected)
exports.getCurrentUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('-password -resetPasswordToken -resetPasswordExpires -verificationToken -refreshTokens');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// Refresh access token
exports.refreshAccessToken = catchAsyncErrors(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return next(new AppError('Refresh token is required', 400));
  }

  // Verify refresh token
  const decoded = verifyRefreshToken(refreshToken);
  if (!decoded) {
    return next(new AppError('Invalid or expired refresh token', 401));
  }

  // Check if refresh token exists in database
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  const tokenHash = hashToken(refreshToken);
  const tokenExists = user.refreshTokens.some(
    rt => rt.token === tokenHash && new Date(rt.expiresAt) > new Date()
  );

  if (!tokenExists) {
    return next(new AppError('Refresh token not found or expired', 401));
  }

  // Generate new access token
  const { accessToken: newAccessToken } = generateTokenPair(user._id);

  res.status(200).json({
    success: true,
    data: {
      accessToken: newAccessToken
    }
  });
});

// Logout (clear all refresh tokens or specific device)
exports.logout = catchAsyncErrors(async (req, res, next) => {
  const { refreshToken, logoutAll } = req.body;

  if (!req.user && !refreshToken) {
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  }

  if (logoutAll && req.user) {
    // Logout from all devices
    await User.findByIdAndUpdate(req.user.id, {
      $set: { refreshTokens: [] }
    });
  } else if (refreshToken) {
    // Logout from specific device
    const tokenHash = hashToken(refreshToken);
    await User.findByIdAndUpdate(req.user?.id || (await User.findOne({ 'refreshTokens.token': tokenHash }))?._id, {
      $pull: { refreshTokens: { token: tokenHash } }
    });
  }

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});
