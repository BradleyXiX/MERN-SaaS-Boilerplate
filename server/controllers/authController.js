const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sanitize = require('mongo-sanitize');
const User = require('../models/User');
const mailer = require('../utils/mailer');
const { generateTokenPair, verifyRefreshToken, hashToken } = require('../utils/tokenService');
const { setAuthCookies, clearAuthCookies, REFRESH_COOKIE_NAME } = require('../utils/cookieHelper');
const verificationEmailTemplate = require('../utils/templates/verificationEmail');
const resetPasswordEmailTemplate = require('../utils/templates/resetPasswordEmail');
const { AppError, catchAsyncErrors } = require('../middleware/errorHandler');

// Register User
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  const sanitized = sanitize(req.body);
  const { name, email, password } = sanitized;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(
      new AppError('User already exists with this email address.', 409, {
        type: 'https://api.example.com/errors/user-exists',
        title: 'Conflict',
      })
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const verificationToken = crypto.randomBytes(32).toString('hex');

  await User.create({
    name,
    email,
    password: hashedPassword,
    verificationToken,
  });

  // Send verification email
  const verifyUrl = `${req.protocol}://${req.get('host')}/api/auth/verify-email?token=${verificationToken}`;
  try {
    await mailer.sendMail({
      to: email,
      subject: 'Verify Your Email Address',
      text: `Click this link to verify your account: ${verifyUrl}`,
      html: verificationEmailTemplate(verifyUrl),
    });
  } catch (mailErr) {
    // Log mail failure without crashing registration
    console.warn('Mail dispatch warning:', mailErr.message);
  }

  res.status(201).json({
    success: true,
    message: 'User registered successfully. Please check your email to verify your account.',
  });
});

// Email verification handler
exports.verifyEmail = catchAsyncErrors(async (req, res, next) => {
  const { token } = sanitize(req.query);

  if (!token) {
    return next(new AppError('Verification token is required.', 400));
  }

  const user = await User.findOne({ verificationToken: token });
  if (!user) {
    return next(
      new AppError('Invalid or expired verification token.', 400, {
        type: 'https://api.example.com/errors/invalid-token',
      })
    );
  }

  user.verified = true;
  user.verificationToken = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Email verified successfully. You may now log in.',
  });
});

// Initiate password reset
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const { email } = sanitize(req.body);

  if (!email) {
    return next(new AppError('Email is required.', 400));
  }

  const user = await User.findOne({ email });
  if (!user) {
    // Avoid user enumeration: return success even if user not found
    return res.status(200).json({
      success: true,
      message: 'If that email address exists, a password reset link has been dispatched.',
    });
  }

  const token = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  await user.save();

  const resetUrl = `${req.protocol}://${req.get('host')}/reset-password?token=${token}`;
  try {
    await mailer.sendMail({
      to: email,
      subject: 'Reset Your Password',
      text: `Click here to reset your password: ${resetUrl}`,
      html: resetPasswordEmailTemplate(resetUrl),
    });
  } catch (mailErr) {
    console.warn('Mail dispatch warning:', mailErr.message);
  }

  res.status(200).json({
    success: true,
    message: 'If that email address exists, a password reset link has been dispatched.',
  });
});

// Complete password reset
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  const { token, password } = sanitize(req.body);

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new AppError('Invalid or expired password reset token.', 400, {
        type: 'https://api.example.com/errors/token-expired',
      })
    );
  }

  user.password = await bcrypt.hash(password, 12);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  // Invalidate existing sessions on password reset
  user.refreshTokens = [];
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password has been reset successfully. Please log in with your new credentials.',
  });
});

// Login User with HttpOnly cookie issuance
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = sanitize(req.body);

  const user = await User.findOne({ email });
  if (!user) {
    return next(
      new AppError('Invalid credentials provided.', 401, {
        type: 'https://api.example.com/errors/invalid-credentials',
        title: 'Unauthorized',
      })
    );
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return next(
      new AppError('Invalid credentials provided.', 401, {
        type: 'https://api.example.com/errors/invalid-credentials',
        title: 'Unauthorized',
      })
    );
  }

  if (!user.verified) {
    return next(
      new AppError('Please verify your email address before logging in.', 403, {
        type: 'https://api.example.com/errors/unverified-account',
        title: 'Forbidden',
      })
    );
  }

  // Generate token pair
  const { accessToken, refreshToken, refreshTokenExpiry } = generateTokenPair(user._id);

  // Store refresh token hash in DB
  user.refreshTokens.push({
    token: hashToken(refreshToken),
    expiresAt: refreshTokenExpiry,
  });

  // Prune expired refresh tokens
  user.refreshTokens = user.refreshTokens.filter((rt) => new Date(rt.expiresAt) > new Date());
  await user.save();

  // Set secure HttpOnly cookies
  setAuthCookies(res, { accessToken, refreshToken });

  res.status(200).json({
    success: true,
    data: {
      accessToken, // Returned for programmatic/bearer API clients
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  });
});

// Get current user (protected)
exports.getCurrentUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id).select(
    '-password -resetPasswordToken -resetPasswordExpires -verificationToken -refreshTokens'
  );

  if (!user) {
    return next(new AppError('User account not found.', 404));
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

// Refresh access token via cookie or request body
exports.refreshAccessToken = catchAsyncErrors(async (req, res, next) => {
  // Check cookie first, fallback to req.body
  const refreshToken = (req.cookies && req.cookies[REFRESH_COOKIE_NAME]) || req.body.refreshToken;

  if (!refreshToken) {
    return next(
      new AppError('Refresh token is required.', 400, {
        type: 'https://api.example.com/errors/missing-token',
      })
    );
  }

  const decoded = verifyRefreshToken(refreshToken);
  if (!decoded) {
    clearAuthCookies(res);
    return next(
      new AppError('Invalid or expired refresh token.', 401, {
        type: 'https://api.example.com/errors/invalid-refresh-token',
      })
    );
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    clearAuthCookies(res);
    return next(new AppError('User not found.', 404));
  }

  const tokenHash = hashToken(refreshToken);
  const tokenExists = user.refreshTokens.some(
    (rt) => rt.token === tokenHash && new Date(rt.expiresAt) > new Date()
  );

  if (!tokenExists) {
    clearAuthCookies(res);
    return next(
      new AppError('Refresh token has expired or was revoked.', 401, {
        type: 'https://api.example.com/errors/revoked-token',
      })
    );
  }

  // Issue refreshed access token
  const { accessToken: newAccessToken } = generateTokenPair(user._id);
  setAuthCookies(res, { accessToken: newAccessToken });

  res.status(200).json({
    success: true,
    data: {
      accessToken: newAccessToken,
    },
  });
});

// Logout (clears cookies and database session records)
exports.logout = catchAsyncErrors(async (req, res) => {
  const refreshToken = (req.cookies && req.cookies[REFRESH_COOKIE_NAME]) || req.body?.refreshToken;
  const logoutAll = req.body?.logoutAll;

  if (req.user && logoutAll) {
    await User.findByIdAndUpdate(req.user.id, {
      $set: { refreshTokens: [] },
    });
  } else if (refreshToken) {
    const tokenHash = hashToken(refreshToken);
    await User.findByIdAndUpdate(req.user?.id || (await User.findOne({ 'refreshTokens.token': tokenHash }))?._id, {
      $pull: { refreshTokens: { token: tokenHash } },
    });
  }

  // Clear client cookies
  clearAuthCookies(res);

  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
});
