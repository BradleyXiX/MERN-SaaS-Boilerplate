# How-To: Automated Testing & Verification Strategy

This guide covers running, writing, and asserting automated tests across the SaaS Pro workspace using Vitest for React 19 frontend components and Jest/Supertest for Express 5 backend services.

---

## 1. Running the Automated Test Suites

### Client Tests (Vitest)

Execute the client test suite from the repository root:

```bash
npm test --prefix client -- --run
```

**Expected Output:**
```
✓ src/utils/errorHandler.test.js  (9 tests)
✓ src/hooks/useAuth.test.jsx  (4 tests)
✓ src/components/ProtectedRoute.test.jsx  (2 tests)

Test Files  3 passed (3)
Tests       15 passed (15)
```

To run with the interactive browser UI:
```bash
npm run test:ui --prefix client
```

### Server Tests (Jest)

Execute the server test suite with `--runInBand`:

```bash
npm test --prefix server -- --runInBand
```

**Expected Output:**
```
PASS middleware/zodValidator.test.js
PASS middleware/errorHandler.test.js

Test Suites: 2 passed, 2 total
Tests:       8 passed, 8 total
```

---

## 2. Writing Server Tests (Jest & Supertest)

### Pattern: Asserting RFC 7807 Problem Details on Validation Failure

```javascript
const request = require('supertest');
const app = require('../app');

describe('POST /api/auth/register Validation Boundaries', () => {
  it('returns 422 Unprocessable Entity when password lacks digits', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Alex Mercer',
        email: 'alex@company.com',
        password: 'NoNumbersInPasswordHere!',
      });

    expect(res.status).toBe(422);
    expect(res.header['content-type']).toContain('application/problem+json');
    expect(res.body).toMatchObject({
      type: 'https://api.example.com/errors/validation-failed',
      title: 'Unprocessable Entity',
      status: 422,
      invalidParams: expect.arrayContaining([
        expect.objectContaining({
          field: 'password',
          message: 'Password must contain at least one number',
        }),
      ]),
    });
  });
});
```

---

## 3. Writing Client Tests (Vitest & React Testing Library)

### Pattern: Testing Authentication Context and Hooks

```jsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, AuthContext } from '../contexts/AuthContext';
import { useContext } from 'react';
import api from '../utils/api';

vi.mock('../utils/api');

describe('AuthContext Session Synchronization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('populates user session when /api/auth/me returns 200', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: { id: 'usr_123', email: 'operator@company.com', role: 'admin' },
      },
    });

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useContext(AuthContext), { wrapper });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user.email).toBe('operator@company.com');
  });
});
```

---

## 4. Continuous Integration (GitHub Actions)

Add this workflow in `.github/workflows/ci.yml`:

```yaml
name: CI Test Verification Suite

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - name: Install Dependencies
        run: npm run install:all
      - name: Run Client Vitest Suite
        run: npm test --prefix client -- --run
      - name: Run Server Jest Suite
        run: npm test --prefix server -- --runInBand
```
