# Refresh Token Implementation

## Overview

This application implements a secure refresh token strategy to improve security and user experience. Access tokens are short-lived (15 minutes) while refresh tokens are long-lived (7 days), allowing users to stay logged in without exposing long-lived credentials.

## Architecture

### Token Types

1. **Access Token** (JWT)
   - Duration: 15 minutes
   - Used for API requests
   - Included in `Authorization: Bearer <token>` header
   - Short-lived for security

2. **Refresh Token** (JWT)
   - Duration: 7 days
   - Stored in browser localStorage
   - Used only to get new access tokens
   - Hashed and stored in database for security

## Server Implementation

### Token Service (`server/utils/tokenService.js`)

Core utility functions for token management:

```javascript
generateAccessToken(userId)      // Generate 15m access token
generateRefreshToken(userId)     // Generate 7d refresh token
generateTokenPair(userId)        // Generate both tokens
verifyAccessToken(token)         // Validate access token
verifyRefreshToken(token)        // Validate refresh token
hashToken(token)                 // Hash token for storage
getTokenExpiry(token)            // Extract expiry from JWT
```

### Database Schema

User model stores refresh tokens:

```javascript
refreshTokens: [
  {
    token: String,           // Hashed refresh token
    expiresAt: Date,        // Token expiration
    createdAt: Date         // When token was issued
  }
]
```

### API Endpoints

#### Login - `POST /api/auth/login`

Returns both tokens:

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "user": { ... }
  }
}
```

Client stores:
- `token` → localStorage.token (access token)
- `refreshToken` → localStorage.refreshToken (refresh token)

#### Refresh Token - `POST /api/auth/refresh-token`

Request:
```json
{
  "refreshToken": "eyJhbGc..."
}
```

Response:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc..."
  }
}
```

#### Logout - `POST /api/auth/logout`

Clears stored refresh tokens:

```json
{
  "refreshToken": "eyJhbGc...",
  "logoutAll": false  // Optional: logout from all devices
}
```

## Client Implementation

### Flow Diagram

```
User Login
    ↓
POST /api/auth/login
    ↓
Save tokens to localStorage
- token (access token)
- refreshToken (refresh token)
    ↓
API Request
    ↓
Include Authorization: Bearer <token>
    ↓
Response 401 Unauthorized? (token expired)
    ↓
Auto-refresh with POST /api/auth/refresh-token
    ↓
Retry original request with new token
```

### API Interceptors (`client/src/utils/api.js`)

**Request Interceptor:**
- Automatically adds access token to headers
- Checks `localStorage.token` for each request

**Response Interceptor:**
- Detects 401 responses (expired token)
- Calls refresh endpoint with `refreshToken`
- Updates `localStorage.token` with new access token
- Retries original request automatically
- Queues concurrent requests during refresh

### AuthContext (`client/src/contexts/AuthContext.jsx`)

Manages token state and provides auth methods:

```javascript
const { 
  user, 
  token, 
  isAuthenticated, 
  loading, 
  error,
  login,        // Returns {success, error}
  logout,       // Clears tokens and state
  refreshAccessToken, // Manual token refresh
  ...
} = useAuth();
```

## Security Features

### Token Security

1. **Refresh tokens are hashed** in database (not plaintext)
2. **Access tokens are short-lived** (15 minutes)
3. **Refresh tokens stored in localStorage** (XSS vulnerability considerations)
4. **Automatic token refresh** before expiration in most cases

### Best Practices Implemented

✅ Refresh tokens validated against database before accepting
✅ Expired refresh tokens cleaned up periodically
✅ Multiple devices support (multiple refresh tokens per user)
✅ Logout from single device or all devices option
✅ Request queue prevents race conditions during refresh
✅ Graceful fallback to login on permanent auth failure

## Usage Examples

### Basic Login

```javascript
import { useAuth } from './hooks/useAuth';

function LoginForm() {
  const { login, error, loading } = useAuth();

  const handleLogin = async (email, password) => {
    const result = await login(email, password);
    if (result.success) {
      // Redirect to dashboard
    } else {
      // Show error
    }
  };
}
```

### Protected Component

```javascript
function Dashboard() {
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div>
      <h1>Welcome {user.name}</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Automatic Token Refresh

No code needed - interceptors handle it automatically:

```javascript
// This request will auto-refresh token if expired
const response = await api.get('/api/auth/me');
```

## Configuration

### Server Environment Variables

```bash
# .env
JWT_SECRET=<your-secret-key>
REFRESH_TOKEN_SECRET=<your-refresh-secret>
```

Generate strong secrets:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Token Expiry Times

Edit in `server/utils/tokenService.js`:

```javascript
const ACCESS_TOKEN_EXPIRY = '15m';   // Access token duration
const REFRESH_TOKEN_EXPIRY = '7d';   // Refresh token duration
```

## Troubleshooting

### User Gets Logged Out After 15 Minutes

This is expected behavior. The refresh token flow should keep them logged in for 7 days:
- Check that `localStorage.refreshToken` is being saved
- Verify refresh endpoint is working: `POST /api/auth/refresh-token`
- Check server logs for refresh token validation errors

### Refresh Token Not Saving

- Check browser dev tools: Application → Local Storage → `refreshToken`
- Verify login response includes `refreshToken` in data.data
- Check localStorage size limits (usually 5-10MB)

### Continuous 401 Errors

- Refresh token may be expired or invalid
- User needs to log in again
- Check that refresh token is stored in database
- Verify `REFRESH_TOKEN_SECRET` matches between environment files

### Request Queue Stuck

- Rare issue with multiple simultaneous requests
- Check server response status codes
- Verify token refresh endpoint is responding

## Advanced Features

### Logout from All Devices

```javascript
// Server stores multiple refresh tokens per user
// Client can request logout from all devices:
POST /api/auth/logout
{
  "logoutAll": true
}
```

### Device Management

Future enhancement: Track refresh token metadata (device, browser, IP):

```javascript
refreshTokens: [
  {
    token: String,
    expiresAt: Date,
    device: "Chrome on Windows",
    ipAddress: "192.168.1.1",
    createdAt: Date
  }
]
```

### Token Rotation

Optional: Implement automatic refresh token rotation (issue new refresh token on each refresh).

## Performance Considerations

- ✅ Request queue prevents multiple simultaneous refresh calls
- ✅ Token refresh happens before requests fail (in most cases)
- ✅ localStorage has no performance penalty
- ✅ Token validation is fast (JWT verification)

## Testing

See [TESTING.md](TESTING.md) for token refresh tests:

```bash
# Server tests
npm --prefix server test

# Client tests  
npm --prefix client test
```

## References

- [JWT Best Practices](https://tools.ietf.org/html/rfc8949)
- [OWASP Token Storage](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html#token-storage)
- [Refresh Token Rotation Pattern](https://auth0.com/blog/refresh-tokens-what-are-they-and-when-to-use-them/)
