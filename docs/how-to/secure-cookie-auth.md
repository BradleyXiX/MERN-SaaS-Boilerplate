# How-To: Configure and Extend Cryptographic Cookie Authentication

This guide demonstrates how to interact with, extend, and protect routes using the SaaS Pro `HttpOnly` cookie session engine across both client and server codebases.

---

## 1. Protecting Server Endpoints with Middleware

### Step 1: Require Valid Authentication
Import [`protect`](file:///c:/Users/Admin/OneDrive/Desktop/Source%20Code/MERN%20SaaS%20Boiler-Plate/server/middleware/auth.js) from `middleware/auth.js`:

```javascript
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Any request without a valid saas_auth_session cookie or Bearer header returns 401 Unauthorized
router.get('/dashboard-metrics', protect, (req, res) => {
  // Access authenticated claims on req.user
  res.json({
    userId: req.user.id,
    role: req.user.role,
    metrics: { cpuUtilization: '12%', memoryAllocated: '4.2GB' },
  });
});
```

### Step 2: Enforce Role-Based Access Control (RBAC)
Chain [`requireRole`](file:///c:/Users/Admin/OneDrive/Desktop/Source%20Code/MERN%20SaaS%20Boiler-Plate/server/middleware/auth.js) after `protect`:

```javascript
const { protect, requireRole } = require('../middleware/auth');

// Only users with role 'admin' can access this route; otherwise returns 403 Forbidden
router.delete('/purge-tenant-data', protect, requireRole('admin'), (req, res) => {
  res.json({ message: 'Tenant data purged.' });
});
```

---

## 2. Protecting Frontend Routes in React 19

Wrap protected views with [`ProtectedRoute`](file:///c:/Users/Admin/OneDrive/Desktop/Source%20Code/MERN%20SaaS%20Boiler-Plate/client/src/components/ProtectedRoute.jsx) in `client/src/App.jsx`:

```jsx
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* Protected routes auto-redirect unauthenticated users to /login */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
```

---

## 3. Consuming API Endpoints from Client Components

Use the configured [`api`](file:///c:/Users/Admin/OneDrive/Desktop/Source%20Code/MERN%20SaaS%20Boiler-Plate/client/src/utils/api.js) instance. Cookies are automatically transmitted via `withCredentials: true`:

```javascript
import api from '../utils/api';

export const fetchTelemetry = async () => {
  // No need to manually extract or attach tokens from localStorage
  const response = await api.get('/api/auth/me');
  return response.data;
};
```

---

## 4. Testing Authenticated Endpoints via Supertest

When writing integration tests in Jest for server endpoints, simulate cookie authentication:

```javascript
const request = require('supertest');
const app = require('../app');
const jwt = require('jsonwebtoken');

describe('GET /api/auth/me', () => {
  it('returns 200 OK when valid session cookie is provided', async () => {
    const token = jwt.sign(
      { id: '670c56b8f1d2e3b4a5678901', role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', [`saas_auth_session=${token}`]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
```
