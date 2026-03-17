const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const mailer = require('../utils/mailer');

exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
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
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; text-align: center; margin-bottom: 20px;">Welcome to Our SaaS Platform!</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
              Thank you for registering. Please verify your email address to complete your account setup.
            </p>
            <div style="text-align: center; margin-bottom: 30px;">
              <a href="${verifyUrl}" style="background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Verify Email Address
              </a>
            </div>
            <p style="color: #999; font-size: 14px; text-align: center;">
              If you didn't create an account, please ignore this email.
            </p>
            <p style="color: #999; font-size: 14px; text-align: center;">
              This link will expire in 24 hours.
            </p>
          </div>
        </div>
      `
    });

    res.status(201).json({ message: 'User registered successfully. Please check your email to verify your account.' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
// email verification handler
exports.verifyEmail = async (req, res) => {
  const { token } = req.query;
  try {
    const user = await User.findOne({ verificationToken: token });
    if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

    user.verified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// initiate password reset
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1h
    await user.save();

    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password?token=${token}`;
    await mailer.sendMail({
      to: email,
      subject: 'Reset Your Password',
      text: `You requested a password reset. Click here to set a new password: ${resetUrl}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; text-align: center; margin-bottom: 20px;">Password Reset Request</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
              We received a request to reset your password. Click the button below to create a new password.
            </p>
            <div style="text-align: center; margin-bottom: 30px;">
              <a href="${resetUrl}" style="background-color: #2196F3; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p style="color: #999; font-size: 14px; text-align: center;">
              If you didn't request a password reset, please ignore this email.
            </p>
            <p style="color: #999; font-size: 14px; text-align: center;">
              This link will expire in 1 hour for security reasons.
            </p>
          </div>
        </div>
      `
    });

    res.status(200).json({ message: 'Password reset email sent' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// complete password reset
exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password has been reset' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });

    res.status(200).json({ token, user: { name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// get current user (protected)
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -resetPasswordToken -resetPasswordExpires -verificationToken');
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// logout (just response, token cleared on client)
exports.logout = (req, res) => {
  res.status(200).json({ message: 'Logged out successfully' });
};
