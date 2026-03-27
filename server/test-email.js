const verificationEmailTemplate = require('./utils/templates/verificationEmail');
const resetPasswordEmailTemplate = require('./utils/templates/resetPasswordEmail');

console.log('--- Verification Email ---');
console.log(verificationEmailTemplate('http://localhost:5000/api/auth/verify-email?token=123'));

console.log('--- Reset Password Email ---');
console.log(resetPasswordEmailTemplate('http://localhost:3000/reset-password?token=abc'));
