const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },

  // email verification
  verified: { type: Boolean, default: false },
  verificationToken: String,

  // password reset
  resetPasswordToken: String,
  resetPasswordExpires: Date,

  // refresh tokens for session management
  refreshTokens: [
    {
      token: String,
      expiresAt: Date,
      createdAt: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);