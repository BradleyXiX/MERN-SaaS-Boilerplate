const resetPasswordEmailTemplate = (resetUrl) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f4f7f6;
    }
    .email-wrapper {
      width: 100%;
      background-color: #f4f7f6;
      padding: 40px 0;
    }
    .email-content {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }
    .email-header {
      background-color: #2196F3;
      color: #ffffff;
      padding: 30px 40px;
      text-align: center;
    }
    .email-header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .email-body {
      padding: 40px;
      color: #334155;
      line-height: 1.6;
    }
    .email-body h2 {
      margin-top: 0;
      color: #1e293b;
      font-size: 20px;
    }
    .button-container {
      text-align: center;
      margin: 35px 0;
    }
    .action-button {
      background-color: #2196F3;
      color: #ffffff !important;
      padding: 14px 28px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      display: inline-block;
      min-width: 200px;
    }
    .email-footer {
      background-color: #f8fafc;
      padding: 20px 40px;
      text-align: center;
      color: #64748b;
      font-size: 13px;
      border-top: 1px solid #e2e8f0;
    }
    .link-fallback {
      word-break: break-all;
      color: #2196F3;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-content">
      <div class="email-header">
        <h1>Password Reset</h1>
      </div>
      <div class="email-body">
        <h2>Reset your password</h2>
        <p>We received a request to reset your password. If you didn't make this request, you can simply ignore this email.</p>
        
        <p>Otherwise, you can reset your password using this link:</p>
        
        <div class="button-container">
          <a href="\${resetUrl}" class="action-button">Reset Password</a>
        </div>
        
        <p>If the button doesn't work, copy and paste the following link into your browser:</p>
        <p class="link-fallback">\${resetUrl}</p>
        
        <p style="margin-top: 30px;">
          Thanks,<br>
          The Team
        </p>
      </div>
      <div class="email-footer">
        <p>This password reset link is only valid for 1 hour for security reasons.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

module.exports = resetPasswordEmailTemplate;
