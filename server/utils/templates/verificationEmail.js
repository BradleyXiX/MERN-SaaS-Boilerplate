const verificationEmailTemplate = (verifyUrl) => `
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
      background-color: #4F46E5;
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
      background-color: #4F46E5;
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
      color: #4F46E5;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-content">
      <div class="email-header">
        <h1>Welcome to Our SaaS Platform</h1>
      </div>
      <div class="email-body">
        <h2>Verify your email address</h2>
        <p>Thank you for registering! You're just one step away from getting started. Please click the button below to verify your email address and activate your account.</p>
        
        <div class="button-container">
          <a href="\${verifyUrl}" class="action-button">Verify Email Address</a>
        </div>
        
        <p>If the button doesn't work, you can copy and paste the following link into your browser:</p>
        <p class="link-fallback">\${verifyUrl}</p>
        
        <p style="margin-top: 30px;">
          Warm regards,<br>
          The Team
        </p>
      </div>
      <div class="email-footer">
        <p>This verification link will expire in 24 hours.</p>
        <p>If you didn't create an account, you can safely ignore this email.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

module.exports = verificationEmailTemplate;
