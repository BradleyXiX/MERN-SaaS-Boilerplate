---
name: api-contracts
description: Enforce runtime Zod schema validation for all endpoints, query parameters, mutations, and webhook payloads, with standardized RFC 7807 Problem Details error formatting.
---

# API Contracts, Schema Validation & RFC 7807 Error Architecture

## Core Directives

Unvalidated inputs lead to runtime exceptions, state corruption, and security vulnerabilities. Every API endpoint must have an explicit contract defining request parameters, query strings, request bodies, and error formats.

This skill governs:
1. **Zod Runtime Schema Validation**: Parsing and sanitizing incoming inputs before reaching controller logic.
2. **RFC 7807 Problem Details**: Standardized error payloads across all HTTP error statuses (400, 401, 403, 404, 422, 429, 500).
3. **Webhook Verification**: Validating external event payloads (e.g., Stripe, GitHub) against strict schemas and cryptographic signatures.

---

## 1. Zod Runtime Schema Validation Middleware

Controllers should never access raw `req.body`, `req.query`, or `req.params` without schema validation.

```typescript
// src/middleware/validate.ts
import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

interface ValidationTargets {
  body?: AnyZodObject;
  query?: AnyZodObject;
  params?: AnyZodObject;
}

export function validate(schemas: ValidationTargets) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params);
      }
      if (schemas.query) {
        req.query = await schemas.query.parseAsync(req.query);
      }
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        res.status(422).json({
          type: 'https://api.example.com/errors/validation-failed',
          title: 'Unprocessable Entity',
          status: 422,
          detail: 'One or more request parameters failed validation criteria.',
          instance: req.originalUrl,
          invalidParams: formattedErrors,
        });
        return;
      }
      next(error);
    }
  };
}
```

### Route-Level Usage Example
```typescript
// src/routes/user.routes.ts
import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';

const router = Router();

const UpdateUserProfileSchema = z.object({
  fullName: z.string().min(2).max(100),
  timezone: z.string().default('UTC'),
  notificationPreferences: z.object({
    emailAlerts: z.boolean(),
    securityDigests: z.boolean(),
  }),
});

const UserParamSchema = z.object({
  userId: z.string().uuid('Invalid user UUID format'),
});

router.patch(
  '/:userId',
  validate({
    params: UserParamSchema,
    body: UpdateUserProfileSchema,
  }),
  async (req, res) => {
    // req.body and req.params are fully validated and typed here
    res.status(200).json({ success: true, user: req.body });
  }
);

export default router;
```

---

## 2. RFC 7807 Structured Problem Details Format

All non-2xx responses must return the standard `application/problem+json` format (RFC 7807):

```json
{
  "type": "https://api.example.com/errors/invalid-credentials",
  "title": "Invalid Credentials",
  "status": 401,
  "detail": "The email or password provided does not match our records.",
  "instance": "/api/v1/auth/login",
  "code": "AUTH_INVALID_CREDENTIALS",
  "timestamp": "2026-10-12T15:20:00Z"
}
```

### Global RFC 7807 Error Handler
```typescript
// src/middleware/error-handler.ts
import { Request, Response, NextFunction } from 'express';

export interface AppErrorOptions {
  type: string;
  title: string;
  status: number;
  detail: string;
  code?: string;
  metadata?: Record<string, unknown>;
}

export class AppError extends Error {
  public readonly type: string;
  public readonly title: string;
  public readonly status: number;
  public readonly detail: string;
  public readonly code?: string;
  public readonly metadata?: Record<string, unknown>;

  constructor(options: AppErrorOptions) {
    super(options.detail);
    this.type = options.type;
    this.title = options.title;
    this.status = options.status;
    this.detail = options.detail;
    this.code = options.code;
    this.metadata = options.metadata;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function globalErrorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  const isProduction = process.env.NODE_ENV === 'production';

  if (err instanceof AppError) {
    res.status(err.status).contentType('application/problem+json').json({
      type: err.type,
      title: err.title,
      status: err.status,
      detail: err.detail,
      code: err.code,
      instance: req.originalUrl,
      timestamp: new Date().toISOString(),
      ...(err.metadata && { metadata: err.metadata }),
    });
    return;
  }

  // Unhandled internal server exceptions
  console.error('Unhandled internal exception:', err);

  res.status(500).contentType('application/problem+json').json({
    type: 'https://api.example.com/errors/internal-server-error',
    title: 'Internal Server Error',
    status: 500,
    detail: isProduction
      ? 'An unexpected error occurred while processing your request.'
      : err.message,
    instance: req.originalUrl,
    timestamp: new Date().toISOString(),
    ...(!isProduction && { stack: err.stack }),
  });
}
```

---

## 3. Webhook Event Contracts

Webhook endpoints must validate both cryptographic payload signatures and structured payload schemas:

```typescript
// src/routes/webhooks/stripe.ts
import { Request, Response } from 'express';
import { z } from 'zod';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const InvoicePaidEventSchema = z.object({
  id: z.string(),
  object: z.literal('event'),
  type: z.literal('invoice.paid'),
  data: z.object({
    object: z.object({
      id: z.string(),
      customer: z.string(),
      amount_paid: z.number().int().positive(),
      currency: z.string().length(3),
    }),
  }),
});

export async function handleStripeWebhook(req: Request, res: Response): Promise<void> {
  const sig = req.headers['stripe-signature'];
  if (!sig || typeof sig !== 'string') {
    res.status(400).send('Missing stripe-signature header');
    return;
  }

  let event: Stripe.Event;
  try {
    // req.body must be the raw Buffer
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    res.status(400).send(`Webhook signature verification failed: ${err.message}`);
    return;
  }

  if (event.type === 'invoice.paid') {
    const validated = InvoicePaidEventSchema.parse(event);
    // Proceed with validated event payload
    console.log(`Invoice ${validated.data.object.id} processed for customer ${validated.data.object.customer}`);
  }

  res.status(200).json({ received: true });
}
```
