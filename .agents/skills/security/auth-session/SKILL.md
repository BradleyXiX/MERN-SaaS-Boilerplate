---
name: auth-session
description: Enforce secure session management, HttpOnly/Secure/SameSite=Strict cookies, role-based access control (RBAC), and brute-force rate limiting.
---

# Authentication, Session Management & RBAC Architecture

## Core Directives

Authentication vulnerabilities represent the most frequent vector for unauthorized data extraction. Custom, homegrown cryptographic algorithms or DIY token storage implementations are strictly forbidden.

This skill governs:
1. **No DIY Crypto / Token Protocols**: Use standard libraries (Argon2id/bcrypt, standard JWT/PASETO implementations, or established auth providers).
2. **Session Storage Standards**: Session identifiers and refresh tokens MUST be persisted in `HttpOnly`, `Secure`, `SameSite=Strict` cookies. Never store auth tokens in `localStorage` or `sessionStorage`.
3. **Role-Based Access Control (RBAC)**: Declarative, fail-closed authorization middleware on every private endpoint.
4. **Brute-Force Rate Limiting**: Tiered IP and account throttling on all authentication gateways.

---

## 1. Secure Cookie & Session Specification

Browser storage like `localStorage` and `sessionStorage` is directly accessible to any script running on the page, leaving credentials vulnerable to XSS attacks.

### Mandatory Cookie Flags
When issuing authentication cookies from Express or Next.js API routes:

```typescript
// src/lib/auth/cookies.ts
import { Response, CookieOptions } from 'express';

const isProduction = process.env.NODE_ENV === 'production';

export const AUTH_COOKIE_NAME = 'saas_auth_session';

export const getAuthCookieOptions = (): CookieOptions => ({
  httpOnly: true, // Inaccessible to document.cookie (XSS immune)
  secure: isProduction, // Transmitted only via HTTPS in production
  sameSite: 'strict', // Immune to Cross-Site Request Forgery (CSRF)
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
});

export function setSessionCookie(res: Response, token: string): void {
  res.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions());
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(AUTH_COOKIE_NAME, {
    ...getAuthCookieOptions(),
    maxAge: 0,
  });
}
```

---

## 2. Password Hashing Standards

Never use MD5, SHA-1, SHA-256, or unsalted hashes for password storage. Use **Argon2id** (preferred) or **bcrypt** with a minimum of 12 salt rounds:

```typescript
// src/lib/auth/password.ts
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

export async function hashPassword(plainText: string): Promise<string> {
  if (plainText.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }
  return bcrypt.hash(plainText, SALT_ROUNDS);
}

export async function verifyPassword(plainText: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}
```

---

## 3. Role-Based Access Control (RBAC) Middleware

Authorization must occur on the server, before invoking route controllers. Never rely solely on client-side UI conditional rendering for access control.

```typescript
// src/middleware/rbac.ts
import { Request, Response, NextFunction } from 'express';

export type UserRole = 'super_admin' | 'tenant_admin' | 'member' | 'viewer';

export interface AuthenticatedUser {
  id: string;
  tenantId: string;
  role: UserRole;
  email: string;
}

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        type: 'https://api.example.com/errors/unauthorized',
        title: 'Unauthorized',
        status: 401,
        detail: 'Authentication is required to access this resource.',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        type: 'https://api.example.com/errors/forbidden',
        title: 'Forbidden',
        status: 403,
        detail: `Role '${req.user.role}' lacks sufficient privileges for this operation.`,
      });
      return;
    }

    next();
  };
}
```

### Multi-Tenant Isolation Check
In multi-tenant systems, verify that the authenticated user's `tenantId` matches the requested resource:

```typescript
export function assertTenantOwnership(req: Request, resourceTenantId: string): void {
  if (!req.user) {
    throw new Error('Unauthenticated request');
  }
  if (req.user.role === 'super_admin') {
    return; // System super_admin bypasses tenant boundary
  }
  if (req.user.tenantId !== resourceTenantId) {
    const error: any = new Error('Access denied to resource in different tenant.');
    error.status = 403;
    throw error;
  }
}
```

---

## 4. Brute-Force Rate Limiting Engine

Public endpoints (login, register, forgot-password, reset-token) must enforce rate limiting using an in-memory or Redis-backed sliding window.

```typescript
// src/middleware/rate-limiter.ts
import rateLimit from 'express-rate-limit';

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15-minute evaluation window
  max: 5, // Maximum 5 failed attempts per window per IP
  standardHeaders: true, // Return standard RateLimit-* headers
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Only punish failed attempts
  message: {
    type: 'https://api.example.com/errors/rate-limit-exceeded',
    title: 'Too Many Requests',
    status: 429,
    detail: 'Too many failed login attempts from this IP. Try again in 15 minutes.',
  },
});

export const apiGlobalRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 120, // 120 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
});
```
