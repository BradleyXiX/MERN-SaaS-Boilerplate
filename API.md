# SaaS Pro — REST API Reference Specification

Authoritative REST API contract for SaaS Pro platform services. All error responses strictly conform to **RFC 7807 Problem Details for HTTP APIs** (`application/problem+json`).

---

## Global Protocol & Transport Conventions

### Base URLs

| Environment | Base URL |
|---|---|
| **Local Development** | `http://localhost:5000` |
| **Production API Gateway** | `https://api.yourdomain.com` |

### Authentication Standards

The API supports dual-channel authentication:
1. **Primary (Web Browsers)**: Automated `HttpOnly`, `Secure`, `SameSite=Strict` cookies (`saas_auth_session` for 15-minute access tokens and `saas_refresh_session` for 7-day refresh tokens).
2. **Secondary (CLI & Programmatic Integrations)**: Standard HTTP `Authorization: Bearer <token>` header.

### RFC 7807 Standard Error Schema

All `4xx` and `5xx` error payloads return `Content-Type: application/problem+json` matching this schema:

```json
{
  "type": "https://api.example.com/errors/validation-failed",
  "title": "Unprocessable Entity",
  "status": 422,
  "detail": "One or more request parameters failed validation criteria.",
  "instance": "/api/auth/register",
  "invalidParams": [
    {
      "field": "email",
      "message": "Invalid email address format",
      "code": "invalid_string"
    }
  ],
  "timestamp": "2026-10-12T19:00:00.000Z"
}
```

---

## Authentication & Session Endpoints

### 1. Register User Account

Initializes a new tenant user identity, hashes the password via bcrypt (12 rounds), and dispatches a cryptographic email verification token.

- **Method**: `POST`
- **Endpoint**: `/api/auth/register`
- **Authentication**: None (Public)
- **Rate Limit**: 5 requests per 15 minutes per IP (`authLimiter`)

#### Headers
| Header | Required | Type | Description |
|---|---|---|---|
| `Content-Type` | Yes | String | Must be `application/json` |
| `Accept` | No | String | `application/json, application/problem+json` |

#### Request Body Schema (JSON)
| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `name` | string | Yes | 2–100 characters, trimmed | Full name of the user |
| `email` | string | Yes | Valid RFC 5322 email, trimmed, lowercase | Primary contact & login email |
| `password` | string | Yes | Min 8 chars, ≥1 uppercase (`[A-Z]`), ≥1 number (`[0-9]`) | Cryptographic account password |

##### Example Request Payload
```json
{
  "name": "Alex Mercer",
  "email": "alex.mercer@enterprise.io",
  "password": "SecurePassword2026!"
}
```

#### Responses

##### 201 Created
Account registered successfully. Verification email dispatched.
```json
{
  "success": true,
  "message": "User registered successfully. Please check your email to verify your account."
}
```

##### 400 Bad Request
Occurs when the request body is malformed or invalid JSON.
```json
{
  "type": "https://api.example.com/errors/bad-request",
  "title": "Bad Request",
  "status": 400,
  "detail": "Failed to parse JSON body at line 1 column 12.",
  "instance": "/api/auth/register",
  "timestamp": "2026-10-12T19:00:00.000Z"
}
```

##### 409 Conflict
Occurs when an account already exists with the provided email address.
```json
{
  "type": "https://api.example.com/errors/user-exists",
  "title": "Conflict",
  "status": 409,
  "detail": "User already exists with this email address.",
  "instance": "/api/auth/register",
  "timestamp": "2026-10-12T19:00:00.000Z"
}
```

##### 422 Unprocessable Entity
Occurs when request payload fails Zod schema constraints.
```json
{
  "type": "https://api.example.com/errors/validation-failed",
  "title": "Unprocessable Entity",
  "status": 422,
  "detail": "One or more request parameters failed validation criteria.",
  "instance": "/api/auth/register",
  "invalidParams": [
    {
      "field": "password",
      "message": "Password must contain at least one uppercase letter",
      "code": "invalid_string"
    }
  ],
  "timestamp": "2026-10-12T19:00:00.000Z"
}
```

##### 429 Too Many Requests
Triggered when request rate exceeds 5 attempts per 15 minutes.
```json
{
  "type": "https://api.example.com/errors/rate-limit-exceeded",
  "title": "Too Many Requests",
  "status": 429,
  "detail": "Too many authentication attempts, please try again later.",
  "instance": "/api/auth/register",
  "timestamp": "2026-10-12T19:00:00.000Z"
}
```

##### 500 Internal Server Error
Unhandled internal error during user provisioning.
```json
{
  "type": "https://api.example.com/errors/internal-server-error",
  "title": "Internal Server Error",
  "status": 500,
  "detail": "An unexpected error occurred while processing your request.",
  "instance": "/api/auth/register",
  "timestamp": "2026-10-12T19:00:00.000Z"
}
```

#### Verification Command (`curl`)
```bash
curl -X POST "http://localhost:5000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alex Mercer",
    "email": "alex.mercer@enterprise.io",
    "password": "SecurePassword2026!"
  }'
```

---

### 2. Login & Session Handshake

Verifies credentials, generates dual JWTs, and issues secure `HttpOnly` session cookies (`saas_auth_session`, `saas_refresh_session`).

- **Method**: `POST`
- **Endpoint**: `/api/auth/login`
- **Authentication**: None (Public)
- **Rate Limit**: 5 requests per 15 minutes per IP (`loginLimiter`)

#### Headers
| Header | Required | Type | Description |
|---|---|---|---|
| `Content-Type` | Yes | String | Must be `application/json` |

#### Request Body Schema (JSON)
| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `email` | string | Yes | Valid email format, trimmed, lowercase | Registered account email |
| `password` | string | Yes | Min 1 character | Plaintext account password |

##### Example Request Payload
```json
{
  "email": "alex.mercer@enterprise.io",
  "password": "SecurePassword2026!"
}
```

#### Responses

##### 200 OK
Returns authenticated session payload and sets cryptographic cookies.
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "670c56b8f1d2e3b4a5678901",
      "name": "Alex Mercer",
      "email": "alex.mercer@enterprise.io",
      "role": "admin"
    }
  }
}
```
*Set-Cookie Headers:*
- `saas_auth_session=<token>; Max-Age=900; Path=/; HttpOnly; SameSite=Strict`
- `saas_refresh_session=<token>; Max-Age=604800; Path=/; HttpOnly; SameSite=Strict`

##### 401 Unauthorized
Invalid email or password provided.
```json
{
  "type": "https://api.example.com/errors/invalid-credentials",
  "title": "Unauthorized",
  "status": 401,
  "detail": "Invalid credentials provided.",
  "instance": "/api/auth/login",
  "timestamp": "2026-10-12T19:00:00.000Z"
}
```

##### 403 Forbidden
Account email address is not yet verified.
```json
{
  "type": "https://api.example.com/errors/unverified-account",
  "title": "Forbidden",
  "status": 403,
  "detail": "Please verify your email address before logging in.",
  "instance": "/api/auth/login",
  "timestamp": "2026-10-12T19:00:00.000Z"
}
```

##### 422 Unprocessable Entity
Validation failure on email format or empty password.
```json
{
  "type": "https://api.example.com/errors/validation-failed",
  "title": "Unprocessable Entity",
  "status": 422,
  "detail": "One or more request parameters failed validation criteria.",
  "instance": "/api/auth/login",
  "invalidParams": [
    {
      "field": "email",
      "message": "Invalid email address format",
      "code": "invalid_string"
    }
  ],
  "timestamp": "2026-10-12T19:00:00.000Z"
}
```

##### 429 Too Many Requests
Breached login brute-force threshold (5 attempts / 15 minutes).
```json
{
  "type": "https://api.example.com/errors/rate-limit-exceeded",
  "title": "Too Many Requests",
  "status": 429,
  "detail": "Too many login attempts, please try again later.",
  "instance": "/api/auth/login",
  "timestamp": "2026-10-12T19:00:00.000Z"
}
```

#### Verification Command (`curl`)
```bash
curl -X POST "http://localhost:5000/api/auth/login" \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "alex.mercer@enterprise.io",
    "password": "SecurePassword2026!"
  }'
```

---

### 3. Refresh Access Token

Rotates expired short-lived access tokens via cookie (`saas_refresh_session`) or body payload. Validates the SHA-256 hash against MongoDB session store.

- **Method**: `POST`
- **Endpoint**: `/api/auth/refresh-token`
- **Authentication**: Refresh Cookie (`saas_refresh_session`) or JSON body `refreshToken`
- **Rate Limit**: Inherits API rate limiter

#### Headers
| Header | Required | Type | Description |
|---|---|---|---|
| `Content-Type` | Optional | String | `application/json` (if sending token in body) |
| `Cookie` | Conditional | String | Contains `saas_refresh_session` |

#### Request Body Schema (JSON - Optional if cookie supplied)
| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `refreshToken` | string | Conditional | Valid JWT refresh signature | Refresh token string |

##### Example Request Payload
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Responses

##### 200 OK
Returns new access token and refreshes `saas_auth_session` cookie.
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

##### 400 Bad Request
Missing refresh token in both cookie and request body.
```json
{
  "type": "https://api.example.com/errors/missing-token",
  "title": "Bad Request",
  "status": 400,
  "detail": "Refresh token is required.",
  "instance": "/api/auth/refresh-token",
  "timestamp": "2026-10-12T19:00:00.000Z"
}
```

##### 401 Unauthorized
Refresh token signature invalid, expired, or revoked in database.
```json
{
  "type": "https://api.example.com/errors/invalid-refresh-token",
  "title": "Unauthorized",
  "status": 401,
  "detail": "Invalid or expired refresh token.",
  "instance": "/api/auth/refresh-token",
  "timestamp": "2026-10-12T19:00:00.000Z"
}
```

#### Verification Command (`curl`)
```bash
curl -X POST "http://localhost:5000/api/auth/refresh-token" \
  -b cookies.txt \
  -c cookies.txt
```

---

### 4. Verify Email Address

Validates the cryptographic token issued during registration and marks the account as verified.

- **Method**: `GET`
- **Endpoint**: `/api/auth/verify-email`
- **Authentication**: None (Public)
- **Rate Limit**: Standard API limits

#### Query Parameters
| Parameter | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `token` | string | Yes | Min 1 char hex string | Cryptographic verification token |

#### Responses

##### 200 OK
Email successfully verified.
```json
{
  "success": true,
  "message": "Email verified successfully. You may now log in."
}
```

##### 400 Bad Request
Token missing, expired, or invalid.
```json
{
  "type": "https://api.example.com/errors/invalid-token",
  "title": "Bad Request",
  "status": 400,
  "detail": "Invalid or expired verification token.",
  "instance": "/api/auth/verify-email?token=invalid_tok",
  "timestamp": "2026-10-12T19:00:00.000Z"
}
```

##### 422 Unprocessable Entity
Query parameter validation failure via Zod.
```json
{
  "type": "https://api.example.com/errors/validation-failed",
  "title": "Unprocessable Entity",
  "status": 422,
  "detail": "One or more request parameters failed validation criteria.",
  "instance": "/api/auth/verify-email",
  "invalidParams": [
    {
      "field": "token",
      "message": "Verification token is required",
      "code": "too_small"
    }
  ],
  "timestamp": "2026-10-12T19:00:00.000Z"
}
```

#### Verification Command (`curl`)
```bash
curl -X GET "http://localhost:5000/api/auth/verify-email?token=8f9c1d2e3b4a56789012345678abcdef8f9c1d2e3b4a56789012345678abcdef"
```

---

### 5. Forgot Password Request

Generates a 1-hour cryptographic password reset token and dispatches reset instructions. Prevents user enumeration by returning 200 OK regardless of whether the email exists.

- **Method**: `POST`
- **Endpoint**: `/api/auth/forgot-password`
- **Authentication**: None (Public)
- **Rate Limit**: 3 requests per 1 hour per IP (`passwordResetLimiter`)

#### Request Body Schema (JSON)
| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `email` | string | Yes | Valid RFC 5322 email, trimmed, lowercase | Registered account email |

##### Example Request Payload
```json
{
  "email": "alex.mercer@enterprise.io"
}
```

#### Responses

##### 200 OK
Password reset email dispatched (or simulated if email does not exist).
```json
{
  "success": true,
  "message": "If that email address exists, a password reset link has been dispatched."
}
```

##### 429 Too Many Requests
Password reset rate limit breached.
```json
{
  "type": "https://api.example.com/errors/rate-limit-exceeded",
  "title": "Too Many Requests",
  "status": 429,
  "detail": "Too many password reset attempts, please try again after 1 hour.",
  "instance": "/api/auth/forgot-password",
  "timestamp": "2026-10-12T19:00:00.000Z"
}
```

#### Verification Command (`curl`)
```bash
curl -X POST "http://localhost:5000/api/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alex.mercer@enterprise.io"
  }'
```

---

### 6. Reset Password

Validates a 1-hour reset token, applies the new password, and invalidates all existing active refresh sessions in MongoDB.

- **Method**: `POST`
- **Endpoint**: `/api/auth/reset-password`
- **Authentication**: None (Public)
- **Rate Limit**: 3 requests per 1 hour per IP (`passwordResetLimiter`)

#### Request Body Schema (JSON)
| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `token` | string | Yes | Min 1 character | Hex reset token |
| `password` | string | Yes | Min 8 chars, ≥1 uppercase (`[A-Z]`), ≥1 number (`[0-9]`) | New password |

##### Example Request Payload
```json
{
  "token": "4f9c1d2e3b4a56789012345678abcdef4f9c1d2e3b4a56789012345678abcdef",
  "password": "NewCompliantPassword2026!"
}
```

#### Responses

##### 200 OK
Password updated and sessions revoked.
```json
{
  "success": true,
  "message": "Password has been reset successfully. Please log in with your new credentials."
}
```

##### 400 Bad Request
Token expired or invalid.
```json
{
  "type": "https://api.example.com/errors/token-expired",
  "title": "Bad Request",
  "status": 400,
  "detail": "Invalid or expired password reset token.",
  "instance": "/api/auth/reset-password",
  "timestamp": "2026-10-12T19:00:00.000Z"
}
```

#### Verification Command (`curl`)
```bash
curl -X POST "http://localhost:5000/api/auth/reset-password" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "4f9c1d2e3b4a56789012345678abcdef4f9c1d2e3b4a56789012345678abcdef",
    "password": "NewCompliantPassword2026!"
  }'
```

---

### 7. Get Current Authenticated Profile

Retrieves the sanitized user profile for the authenticated session.

- **Method**: `GET`
- **Endpoint**: `/api/auth/me`
- **Authentication**: Session Cookie (`saas_auth_session`) or Bearer Token (`Authorization: Bearer <jwt>`)
- **Required RBAC Role**: `user` or `admin`
- **Rate Limit**: Standard API limits

#### Headers
| Header | Required | Type | Description |
|---|---|---|---|
| `Authorization` | Conditional | String | `Bearer <access_token>` (if not using cookie) |
| `Cookie` | Conditional | String | Must contain `saas_auth_session` |

#### Responses

##### 200 OK
Returns sanitized user record without secret attributes.
```json
{
  "success": true,
  "data": {
    "_id": "670c56b8f1d2e3b4a5678901",
    "name": "Alex Mercer",
    "email": "alex.mercer@enterprise.io",
    "role": "admin",
    "verified": true,
    "createdAt": "2026-10-12T14:22:10.000Z",
    "updatedAt": "2026-10-12T14:22:10.000Z"
  }
}
```

##### 401 Unauthorized
Missing or expired session credentials.
```json
{
  "type": "https://api.example.com/errors/unauthorized",
  "title": "Unauthorized",
  "status": 401,
  "detail": "Authentication credentials are required to access this resource.",
  "instance": "/api/auth/me",
  "timestamp": "2026-10-12T19:00:00.000Z"
}
```

##### 404 Not Found
User account deleted or no longer present in MongoDB.
```json
{
  "type": "https://api.example.com/errors/not-found",
  "title": "Not Found",
  "status": 404,
  "detail": "User account not found.",
  "instance": "/api/auth/me",
  "timestamp": "2026-10-12T19:00:00.000Z"
}
```

#### Verification Command (`curl`)
```bash
# Using cookie jar:
curl -X GET "http://localhost:5000/api/auth/me" -b cookies.txt

# Using Bearer header fallback:
curl -X GET "http://localhost:5000/api/auth/me" \
  -H "Authorization: Bearer test_jwt_token_sample"
```

---

### 8. Terminate Session (Logout)

Invalidates authentication cookies by setting `Max-Age: 0` and removes the active refresh token hash from MongoDB. Supports revoking all active devices.

- **Method**: `POST`
- **Endpoint**: `/api/auth/logout`
- **Authentication**: Session Cookie (`saas_auth_session`) or JSON body `refreshToken`
- **Rate Limit**: Standard API limits

#### Request Body Schema (JSON - Optional)
| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `refreshToken` | string | No | Valid JWT string | Refresh token to revoke |
| `logoutAll` | boolean | No | Default `false` | When `true`, revokes all active device sessions |

##### Example Request Payload
```json
{
  "logoutAll": true
}
```

#### Responses

##### 200 OK
Cookies cleared and tokens revoked.
```json
{
  "success": true,
  "message": "Logged out successfully."
}
```
*Set-Cookie Headers:*
- `saas_auth_session=; Max-Age=0; Path=/; HttpOnly; SameSite=Strict`
- `saas_refresh_session=; Max-Age=0; Path=/; HttpOnly; SameSite=Strict`

#### Verification Command (`curl`)
```bash
curl -X POST "http://localhost:5000/api/auth/logout" \
  -b cookies.txt \
  -c cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"logoutAll": false}'
```

---

### 9. Platform Health & Diagnostics

Inspects gateway state and database connection health.

- **Method**: `GET`
- **Endpoint**: `/api/health`
- **Authentication**: None (Public)
- **Rate Limit**: Unthrottled

#### Responses

##### 200 OK
```json
{
  "status": "healthy",
  "timestamp": "2026-10-12T19:00:00.000Z",
  "dbConnected": true
}
```

#### Verification Command (`curl`)
```bash
curl -X GET "http://localhost:5000/api/health"
```
