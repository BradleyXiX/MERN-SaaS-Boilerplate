# API Reference

Complete REST API documentation for MERN SaaS Boilerplate.

## Base URL

```
Development: http://localhost:5000
Production: https://your-domain.com
```

## Authentication

All protected endpoints require the JWT access token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

## API Endpoints

### Authentication

#### Register
Create a new user account with email verification.

```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully. Please check your email to verify your account."
}
```

**Error Responses:**
```json
{
  "success": false,
  "message": "User already exists with this email",
  "statusCode": 400
}
```

**Rate Limit:** 5 requests per 15 minutes per IP

---

#### Login
Authenticate user and receive tokens.

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    }
  }
}
```

**Error Responses:**
```json
{
  "success": false,
  "message": "Invalid credentials",
  "statusCode": 401
}
```

**Rate Limit:** 10 requests per 15 minutes per IP

---

#### Verify Email
Verify user email with token from registration email.

```
GET /api/auth/verify-email?token=<verification_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

**Error Responses:**
```json
{
  "success": false,
  "message": "Invalid or expired verification token",
  "statusCode": 400
}
```

---

#### Refresh Token
Get a new access token using refresh token (no rate limit).

```
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
```json
{
  "success": false,
  "message": "Invalid or expired refresh token",
  "statusCode": 401
}
```

---

#### Forgot Password
Request password reset email.

```
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset email sent successfully"
}
```

**Rate Limit:** 3 requests per hour per IP

---

#### Reset Password
Set new password using token from reset email.

```
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "<reset_token>",
  "password": "NewSecurePassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password has been reset successfully"
}
```

**Rate Limit:** 3 requests per hour per IP

---

#### Get Current User
Retrieve authenticated user's profile.

```
GET /api/auth/me
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "verified": true,
    "createdAt": "2026-06-01T10:30:00Z",
    "updatedAt": "2026-06-02T15:45:00Z"
  }
}
```

**Error Responses:**
```json
{
  "success": false,
  "message": "User not found",
  "statusCode": 404
}
```

---

#### Logout
Logout user and revoke refresh token.

```
POST /api/auth/logout
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "logoutAll": false
}
```

**Query Parameters:**
- `logoutAll` (boolean, optional): If true, logs out from all devices. Default: false

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400,
  "error": {
    "details": "Additional error details (development only)"
  }
}
```

### HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Successful request |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid input or missing required fields |
| 401 | Unauthorized | Invalid or expired token |
| 403 | Forbidden | Email not verified |
| 404 | Not Found | Resource not found |
| 422 | Unprocessable Entity | Validation error |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

## Validation Rules

### Registration
- `name`: Required, string, 2-100 characters
- `email`: Required, valid email format, unique
- `password`: Required, minimum 8 characters

### Login
- `email`: Required, valid email format
- `password`: Required, non-empty string

### Password Reset
- `password`: Required, minimum 8 characters

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

| Endpoint | Limit |
|----------|-------|
| POST /api/auth/register | 5 requests per 15 minutes per IP |
| POST /api/auth/login | 10 requests per 15 minutes per IP |
| POST /api/auth/forgot-password | 3 requests per hour per IP |
| POST /api/auth/reset-password | 3 requests per hour per IP |
| Other endpoints | 100 requests per minute per IP |

When rate limit is exceeded, response is:

```json
{
  "success": false,
  "message": "Too many requests, please try again later",
  "statusCode": 429
}
```

## Token Lifecycle

### Access Token
- **Duration:** 15 minutes
- **Storage:** localStorage (client)
- **Purpose:** API request authentication
- **Refreshes automatically** when expired

### Refresh Token
- **Duration:** 7 days
- **Storage:** localStorage (client) + hashed database (server)
- **Purpose:** Obtain new access tokens
- **Must be stored securely**

See [REFRESH_TOKEN_GUIDE.md](./REFRESH_TOKEN_GUIDE.md) for detailed token information.

## Testing API Endpoints

### Using cURL

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePassword123"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePassword123"
  }'

# Get Current User (replace TOKEN with actual token)
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer TOKEN"
```

### Using Postman

1. Import the API collection into Postman
2. Set environment variables:
   - `baseUrl`: http://localhost:5000
   - `accessToken`: Copy from login response
   - `refreshToken`: Copy from login response
3. Use the pre-configured requests

## Pagination (Future)

When pagination is implemented, use these query parameters:

```
GET /api/resource?page=1&limit=20&sort=createdAt&order=desc
```

## Versioning

Current API version: **v1**

Future versions will use URL prefix: `/api/v2/...`

## Support

For API issues or questions:
1. Check this documentation
2. Review error messages carefully
3. Check existing GitHub issues
4. Create a new issue with details

---

**Last Updated:** June 2026  
**Version:** 1.0.0
