# Testing Guide

This project includes comprehensive testing setup for both the backend (server) and frontend (client).

## Server Testing (Node.js/Jest)

### Running Tests

```bash
cd server

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test Structure

Server tests are located in `__tests__` directories or alongside source files with `.test.js` suffix.

**Example test locations:**
- `middleware/__tests__/validation.test.js`
- `controllers/authController.test.js`
- `models/User.test.js`

### Writing Server Tests

```javascript
describe('Auth Controller', () => {
  it('should login user successfully', async () => {
    // Test implementation
  });
});
```

## Client Testing (React/Vitest)

### Running Tests

```bash
cd client

# Run all tests
npm test

# Run tests in watch mode (auto-rerun on changes)
npm test -- --watch

# Run tests with UI dashboard
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

### Test Structure

Client tests are located alongside source files with `.test.js` or `.test.jsx` suffix.

**Example test locations:**
- `src/hooks/useAuth.test.js`
- `src/components/ProtectedRoute.test.js`
- `src/utils/errorHandler.test.js`
- `src/pages/Login.test.jsx`

### Writing Client Tests

```javascript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected text')).toBeInTheDocument();
  });
});
```

## Testing Best Practices

### Server (Jest)

1. **Unit Tests**: Test individual functions and middleware in isolation
   - Mock external dependencies (database, email, etc.)
   - Use `jest.mock()` for dependencies

2. **Integration Tests**: Test API endpoints with `supertest`
   ```javascript
   const request = require('supertest');
   const app = require('../app');
   
   describe('POST /api/auth/login', () => {
     it('should login user', async () => {
       const response = await request(app)
         .post('/api/auth/login')
         .send({ email: 'test@example.com', password: 'password' });
       expect(response.status).toBe(200);
     });
   });
   ```

3. **Coverage**: Aim for at least 80% code coverage
   - Run: `npm run test:coverage`
   - Report available in `coverage/` directory

### Client (Vitest)

1. **Unit Tests**: Test hooks, utilities, and components
   - Mock API calls with `vi.mock()`
   - Test user interactions with `userEvent`

2. **Component Tests**: Test React components with React Testing Library
   ```javascript
   import { render, screen } from '@testing-library/react';
   import userEvent from '@testing-library/user-event';
   
   it('should submit form', async () => {
     render(<LoginForm />);
     const user = userEvent.setup();
     await user.type(screen.getByLabelText('Email'), 'test@example.com');
     await user.click(screen.getByRole('button', { name: /login/i }));
   });
   ```

3. **Hook Tests**: Use `renderHook` for custom hooks
   ```javascript
   import { renderHook, act } from '@testing-library/react';
   
   it('should update state', () => {
     const { result } = renderHook(() => useAuth());
     act(() => {
       result.current.logout();
     });
     expect(result.current.isAuthenticated).toBe(false);
   });
   ```

## CI/CD Integration

Tests are configured to run in CI/CD pipelines. Ensure:

1. All tests pass locally before pushing
2. Coverage requirements are met
3. No console errors or warnings

## Troubleshooting

### Server Tests Hanging

- Use `jest --detectOpenHandles` to find unclosed resources
- Close database connections in `afterAll()` hooks
- Add timeouts: `jest.setTimeout(10000);`

### Client Tests Timeout

- Increase timeout: `it('...', async () => {...}, 10000)`
- Check for unresolved promises in async operations
- Mock external API calls properly

### Mock Issues

**Server:**
```javascript
jest.mock('../utils/mailer', () => ({
  sendEmail: jest.fn().mockResolvedValue(true),
}));
```

**Client:**
```javascript
vi.mock('../utils/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));
```

## Next Steps

1. Add more test cases for authentication flows
2. Set up code coverage thresholds
3. Integrate with GitHub Actions for CI/CD
4. Add E2E tests with Playwright or Cypress
