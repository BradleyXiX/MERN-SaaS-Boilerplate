# System Architecture

## Overview

This MERN SaaS boilerplate follows a classic three-tier architecture with a React frontend, Node.js/Express backend, and MongoDB database.

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React + Vite)                 │
│  - React Router for navigation                              │
│  - Axios for API calls with JWT auth                        │
│  - Material-UI for components                               │
│  - Protected route wrapper for auth                         │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ HTTP/REST API
                  │ http://localhost:5000/api
                  │
┌─────────────────▼───────────────────────────────────────────┐
│                  BACKEND (Express + Node.js)                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Routes Layer (/routes)                               │   │
│  │ - /api/auth/* endpoints                              │   │
│  └────────────┬─────────────────────────────────────────┘   │
│  ┌────────────▼─────────────────────────────────────────┐   │
│  │ Middleware Layer (/middleware)                       │   │
│  │ - Validation (express-validator)                     │   │
│  │ - Authentication (JWT verification)                  │   │
│  │ - Rate limiting (express-rate-limit)                 │   │
│  │ - Error handling (custom handler)                    │   │
│  └────────────┬─────────────────────────────────────────┘   │
│  ┌────────────▼─────────────────────────────────────────┐   │
│  │ Controllers Layer (/controllers)                     │   │
│  │ - Business logic for auth flows                      │   │
│  │ - Password hashing with bcryptjs                     │   │
│  │ - JWT token generation                              │   │
│  │ - Email sending via Nodemailer                       │   │
│  └────────────┬─────────────────────────────────────────┘   │
│  ┌────────────▼─────────────────────────────────────────┐   │
│  │ Data Layer (/models)                                 │   │
│  │ - Mongoose User schema                               │   │
│  │ - Data validation and indexing                       │   │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ Mongoose ODM
                  │ mongodb://localhost:27017/saas
                  │
┌─────────────────▼───────────────────────────────────────────┐
│                   DATABASE (MongoDB)                        │
│  - Users collection with encrypted passwords               │
│  - Indexes for email uniqueness                            │
│  - TTL (Time To Live) for session tokens (future)          │
└─────────────────────────────────────────────────────────────┘
```

## Authentication Flow

### Registration Flow

```
User → Signup Form → POST /api/auth/register
         ↓
    [Validation Middleware]
    - Email format validation
    - Password strength validation
    - Duplicate email check
         ↓
    [Auth Controller]
    - Hash password with bcryptjs
    - Create user in MongoDB
    - Generate verification token
    - Send verification email via Nodemailer
         ↓
    Response to Frontend:
    { success: true, data: { user }, message: "Check your email" }
         ↓
User receives email → Clicks verification link → GET /verify?token=...
         ↓
    [Controller verifies token]
    - Finds user by token
    - Marks user as verified
    - Clears token
         ↓
Redirect to Dashboard (now user can login)
```

### Login Flow

```
User → Login Form → POST /api/auth/login
         ↓
    [Validation Middleware]
    - Email/password format check
         ↓
    [Auth Controller]
    - Find user by email
    - Compare password with bcrypt
    - Check email is verified
    - Generate JWT token
         ↓
    Response:
    { success: true, data: { user, token } }
         ↓
Frontend stores token in localStorage
         ↓
All subsequent requests include:
Authorization: Bearer <token>
         ↓
[Auth Middleware on protected routes]
- Extracts token from header
- Verifies JWT signature
- Attaches user to request object
```

### Password Reset Flow

```
User → Forgot Password Form → POST /api/auth/forgot-password
         ↓
    [Auth Controller]
    - Find user by email
    - Generate reset token (expires in 24h)
    - Send reset email with link
         ↓
User receives email → Clicks reset link → /reset-password?token=...
         ↓
Frontend shows new password form
         ↓
User submits → POST /api/auth/reset-password
         ↓
    [Validation + Controller]
    - Verify token is valid and not expired
    - Hash new password
    - Update user password
    - Invalidate token
         ↓
Response: { success: true, message: "Password reset successfully" }
```

## Component Architecture

### Backend File Organization

```
server/
├── app.js                          # Express app initialization
│   - Middleware setup (helmet, cors, morgan)
│   - Route mounting
│   - Error handler
│   - MongoDB connection
│
├── controllers/authController.js   # Business Logic
│   - register()      → Creates user, sends verification email
│   - login()         → Authenticates user, returns JWT
│   - verifyEmail()   → Marks user as verified
│   - logout()        → Invalidates session (optional)
│   - forgotPassword() → Generates reset token, sends email
│   - resetPassword()  → Validates token, updates password
│
├── models/User.js                  # MongoDB Schema
│   - email (unique, required)
│   - password (hashed, required)
│   - name (required)
│   - isVerified (default: false)
│   - role (enum: user/admin)
│   - verificationToken
│   - resetPasswordToken
│   - resetPasswordExpires
│   - createdAt
│
├── middleware/
│   ├── auth.js              # JWT verification
│   │   - Extracts token from header
│   │   - Verifies signature
│   │   - Attaches user to request
│   │
│   ├── validation.js        # Input validation rules
│   │   - Email format
│   │   - Password strength
│   │   - Required fields
│   │
│   ├── rateLimiter.js       # Rate limiting per IP
│   │   - Auth endpoints: 5 requests/15 min
│   │
│   └── errorHandler.js      # Centralized error handling
│       - Formats error responses
│       - Logs errors
│       - Sets appropriate status codes
│
├── routes/auth.js           # Route definitions
│   - POST   /register
│   - POST   /login
│   - POST   /logout
│   - GET    /verify-email
│   - POST   /forgot-password
│   - POST   /reset-password
│   - GET    /me (protected)
│
├── utils/
│   ├── logger.js            # Winston logger configuration
│   │   - File and console logging
│   │   - Log levels (error, warn, info)
│   │
│   ├── mailer.js            # Nodemailer configuration
│   │   - SMTP connection
│   │   - Email sending helper
│   │
│   └── templates/
│       ├── verificationEmail.js   # Email template for verification
│       └── resetPasswordEmail.js  # Email template for password reset
│
└── logs/                    # Application logs directory
    - error.log
    - combined.log
```

### Frontend Component Hierarchy

```
Frontend Structure:
src/
├── main.jsx                 # Entry point
├── App.jsx                  # Main app component with routing
│
├── pages/                   # Page components (route-level)
│   ├── Landing.jsx         # Home page (public)
│   ├── Login.jsx           # Login page (public)
│   ├── Signup.jsx          # Registration page (public)
│   ├── ForgotPassword.jsx  # Password reset request (public)
│   ├── ResetPassword.jsx   # Password reset form (public)
│   ├── Verify.jsx          # Email verification (auto-triggered)
│   └── Dashboard.jsx       # User dashboard (protected)
│
├── components/             # Reusable components
│   └── ProtectedRoute.jsx  # Route wrapper for auth
│
├── hooks/                  # Custom React hooks (e.g., useAuth, useApi)
│
├── utils/                  # Utility functions
│   ├── api.js             # Axios instance with interceptors
│   ├── auth.js            # Auth helpers (token management)
│   └── validation.js      # Client-side validation
│
└── assets/                # Static files (images, fonts)
```

## Data Model

### User Schema (MongoDB)

```javascript
{
  _id: ObjectId,
  email: String (unique, required, lowercase),
  password: String (hashed, required),
  name: String (required),
  isVerified: Boolean (default: false),
  role: String (enum: ['user', 'admin'], default: 'user'),
  
  // Email verification
  verificationToken: String (null after verified),
  
  // Password reset
  resetPasswordToken: String (null normally),
  resetPasswordExpires: Date (24 hours from generation),
  
  // Timestamps
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

## Security Architecture

### Password Security
- Passwords hashed with **bcryptjs** (10 salt rounds)
- Bcrypt automatically handles salting and hashing
- Passwords never stored in plaintext
- Never transmitted over unencrypted HTTP

### Token Security
- JWT tokens signed with `JWT_SECRET`
- Tokens include user ID and email (encoded, not encrypted)
- Tokens expire (configurable, default 7 days recommended)
- Tokens stored client-side in localStorage
- HTTPS required in production

### CORS & Headers
- **Helmet.js** sets secure HTTP headers
- **CORS** middleware configures allowed origins
- X-Frame-Options prevents clickjacking
- Content-Security-Policy prevents XSS

### Rate Limiting
- Authentication endpoints rate limited
- 5 requests per 15 minutes per IP
- Prevents brute force attacks
- Prevents email spam abuse

### Input Validation
- **Express-validator** for server-side validation
- Email format validation
- Password strength requirements
- XSS prevention through sanitization
- SQL injection prevention (MongoDB uses parameterized queries)

## Request-Response Cycle

### Example: Login Request

```
FRONTEND:
┌─────────────────────────────────────┐
│ User enters credentials             │
│ handleLogin() called                │
│ POST /api/auth/login                │
│ { email, password }                 │
└────────────────┬────────────────────┘
                 │
                 │ Axios sends request
                 │ No token yet
                 ↓
BACKEND:
┌─────────────────────────────────────┐
│ 1. Route /api/auth/login            │
│    ↓ POST /api/auth/login           │
│                                     │
│ 2. Validation Middleware            │
│    - Check email format             │
│    - Check password not empty       │
│    → Next() or error response       │
│                                     │
│ 3. Rate Limit Middleware            │
│    - Check requests per IP          │
│    → Next() or 429 error           │
│                                     │
│ 4. Controller: authController.js    │
│    - Find user by email             │
│    - Compare passwords with bcrypt  │
│    - Check email verified           │
│    - Generate JWT token             │
│    - Return { user, token }         │
│                                     │
│ 5. Error Handler (if error)         │
│    - Format error response          │
│    - Log error                      │
│    - Send error status code         │
└────────────────┬────────────────────┘
                 │
                 │ Response with token
                 ↓
FRONTEND:
┌─────────────────────────────────────┐
│ Receive response                    │
│ Check response.success              │
│ Store token in localStorage         │
│ Redirect to dashboard               │
│ Add token to all future requests    │
└─────────────────────────────────────┘
```

## Data Flow Example: Signup

```
1. USER FILLS FORM
   └─ Email, Password, Name, Confirm Password

2. CLIENT-SIDE VALIDATION
   ├─ Check password === confirmPassword
   ├─ Check password strength (optional)
   └─ Format validation

3. API REQUEST
   └─ POST /api/auth/register
      { email, password, name }

4. SERVER-SIDE VALIDATION
   ├─ Email format validation
   ├─ Password strength check
   ├─ Email not already registered
   └─ Return errors if validation fails

5. PASSWORD HASHING
   ├─ Generate salt (10 rounds)
   ├─ Hash password with salt
   └─ Never store plaintext password

6. CREATE USER IN DATABASE
   ├─ Insert document to users collection
   ├─ Set isVerified = false
   ├─ Set verificationToken = random token
   └─ Set timestamps

7. SEND VERIFICATION EMAIL
   ├─ Generate email template
   ├─ Include verification link with token
   ├─ Send via Nodemailer
   └─ Log sent status

8. RESPONSE TO FRONTEND
   ├─ Return { success: true, data: user }
   ├─ Message: "Check your email to verify"
   └─ Do NOT return password

9. FRONTEND
   ├─ Show success message
   ├─ Redirect to verify page or login
   └─ User checks email
```

## API Response Format

All endpoints follow this standard response structure:

```javascript
{
  success: Boolean,           // Operation success/failure
  statusCode: Number,         // HTTP status code (duplicate of header)
  data: {                     // Payload (if success)
    user: {
      id: String,
      email: String,
      name: String,
      role: String,
      isVerified: Boolean
    },
    token?: String            // JWT token (if applicable)
  },
  message: String             // User-friendly message
}
```

## Error Handling Strategy

```
ERRORS CAUGHT AT:

1. Input Validation (Middleware)
   → 400 Bad Request
   → "Invalid email format"

2. Business Logic (Controller)
   → 401 Unauthorized (auth failed)
   → 404 Not Found (user doesn't exist)
   → 409 Conflict (email already registered)

3. Database Errors (Mongoose)
   → 500 Internal Server Error
   → Logged to file
   → Generic message to user

4. Uncaught Errors (Global Handler)
   → 500 Internal Server Error
   → Logged to Winston logger
   → Stack trace in logs, generic message to user
```

## Scalability Considerations

### Current Limitations
- Single server instance (no load balancing)
- In-memory rate limiter (doesn't persist across restarts)
- Tokens in localStorage (vulnerable to XSS)

### Future Improvements
- Add Redis for rate limiting & session store
- Implement refresh tokens (short-lived + refresh)
- Use httpOnly cookies for tokens
- Add database replication
- Horizontal scaling with load balancer
- Separate file storage (AWS S3) for future avatar uploads

## Security Checklist

- ✅ Passwords hashed with bcryptjs
- ✅ JWT tokens for authentication
- ✅ HTTPS recommended (configured in production)
- ✅ Rate limiting on auth endpoints
- ✅ Input validation (server-side)
- ✅ CORS configured
- ✅ Helmet.js for security headers
- ✅ .env file for secrets (not in git)
- ✅ Error handling (no stack traces to clients)
- ⚠️ Consider: XSS protection, CSRF tokens (for future forms)
- ⚠️ Consider: Refresh token rotation
- ⚠️ Consider: Account lockout after failed attempts
