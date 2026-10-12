/**
 * Unit tests for Zod validation middleware and cookie helpers
 */

const { validateRequest, registerSchema, loginSchema } = require('../middleware/zodValidator');
const { getAuthCookieOptions, getRefreshCookieOptions } = require('../utils/cookieHelper');

describe('Zod Validator Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {}, query: {}, params: {}, originalUrl: '/api/auth/register' };
    res = {
      status: jest.fn().mockReturnThis(),
      contentType: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  it('passes validation when register body meets constraints', async () => {
    req.body = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'SecurePassword123!',
    };

    const middleware = validateRequest({ body: registerSchema });
    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 422 with RFC 7807 problem details when email is invalid', async () => {
    req.body = {
      name: 'Jane Doe',
      email: 'invalid-email-string',
      password: 'SecurePassword123!',
    };

    const middleware = validateRequest({ body: registerSchema });
    await middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'https://api.example.com/errors/validation-failed',
        status: 422,
        invalidParams: expect.arrayContaining([
          expect.objectContaining({ field: 'email' }),
        ]),
      })
    );
  });

  it('rejects short passwords missing uppercase characters or numbers', async () => {
    req.body = {
      email: 'jane@example.com',
      password: 'short',
    };

    const middleware = validateRequest({ body: loginSchema });
    await middleware(req, res, next);

    // login schema allows any password >= 1 char, but let's test register schema requirements
    const regMiddleware = validateRequest({ body: registerSchema });
    req.body.name = 'Jane';
    await regMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(422);
  });
});

describe('Cookie Session Helper', () => {
  it('enforces httpOnly and sameSite=strict on auth cookies', () => {
    const authOpts = getAuthCookieOptions();
    expect(authOpts.httpOnly).toBe(true);
    expect(authOpts.sameSite).toBe('strict');
    expect(authOpts.path).toBe('/');
  });

  it('enforces httpOnly and sameSite=strict on refresh cookies', () => {
    const refreshOpts = getRefreshCookieOptions();
    expect(refreshOpts.httpOnly).toBe(true);
    expect(refreshOpts.sameSite).toBe('strict');
    expect(refreshOpts.maxAge).toBe(7 * 24 * 60 * 60 * 1000);
  });
});
