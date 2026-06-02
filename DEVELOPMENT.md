# Development Guide

Guide for setting up your development environment and contributing to MERN SaaS Boilerplate.

## Table of Contents

- [Development Setup](#development-setup)
- [Project Workflow](#project-workflow)
- [Code Standards](#code-standards)
- [Git Workflow](#git-workflow)
- [Debugging](#debugging)
- [Performance](#performance)

## Development Setup

### System Requirements

- **Node.js:** 16.0 or higher
- **npm:** 8.0 or higher
- **MongoDB:** 5.0 or higher (local or Atlas)
- **Git:** Latest version
- **Code Editor:** VS Code (recommended)

### VS Code Extensions (Recommended)

Install these extensions for better development experience:

- **ES7+ React/Redux/React-Native snippets** (dsznajder)
- **Prettier** (Code formatter)
- **ESLint** (Linting)
- **Thunder Client** or **REST Client** (API testing)
- **MongoDB for VS Code** (Database management)
- **GitLens** (Git history and blame)
- **Error Lens** (Inline error display)

### Initial Setup

```bash
# 1. Clone repository
git clone https://github.com/BradleyXiX/MERN-SaaS-Boilerplate.git
cd MERN-SaaS-Boilerplate

# 2. Install dependencies
npm run install:all

# 3. Setup environment variables
cp server/.env.example server/.env
cp client/.env.example client/.env

# 4. Configure server/.env
# Edit these values:
# - MONGO_URI: MongoDB connection string
# - JWT_SECRET: Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# - REFRESH_TOKEN_SECRET: Generate with same command

# 5. (Optional) Configure email service in server/.env
# - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS

# 6. Start development servers
npm run dev
```

## Project Workflow

### Daily Development

```bash
# Start development mode (watches for changes)
npm run dev

# In separate terminal - run tests in watch mode
cd server && npm run test:watch
cd client && npm run test:watch

# Check code coverage
npm --prefix server run test:coverage
npm --prefix client run test:coverage
```

### File Structure Conventions

#### Backend (server/)

```
server/
├── controllers/
│   ├── authController.js      # Auth business logic
│   └── *.test.js              # Unit tests
├── middleware/
│   ├── auth.js                # JWT verification
│   ├── errorHandler.js        # Error handling
│   ├── rateLimiter.js         # Rate limiting
│   ├── validation.js          # Input validation
│   └── *.test.js              # Middleware tests
├── models/
│   ├── User.js                # User schema
│   └── *.test.js              # Model tests
├── routes/
│   └── auth.js                # API routes
├── utils/
│   ├── tokenService.js        # Token management
│   ├── logger.js              # Logging
│   ├── mailer.js              # Email service
│   └── templates/             # Email templates
└── app.js                     # Express setup
```

#### Frontend (client/src/)

```
client/src/
├── components/
│   ├── ProtectedRoute.jsx     # Auth wrapper
│   ├── ProtectedRoute.test.js # Component tests
│   └── *.jsx                  # Reusable components
├── contexts/
│   ├── AuthContext.jsx        # Auth state
│   └── AuthContext.test.js    # Context tests
├── hooks/
│   ├── useAuth.js             # Auth hook
│   ├── useAuth.test.js        # Hook tests
│   └── *.js                   # Custom hooks
├── pages/
│   ├── Login.jsx              # Page components
│   ├── Signup.jsx
│   ├── Dashboard.jsx
│   └── *.jsx
├── utils/
│   ├── api.js                 # Axios instance
│   ├── errorHandler.js        # Error utilities
│   ├── api.test.js            # Utility tests
│   └── *.js
├── App.jsx                    # Main app component
└── main.jsx                   # Entry point
```

### Adding New Features

#### 1. Backend Feature

```bash
# Create feature branch
git checkout -b feature/user-profile

# Create model (if needed)
# server/models/Profile.js

# Create controller
# server/controllers/profileController.js

# Create routes
# Add to server/routes/profile.js

# Add tests
# server/controllers/profileController.test.js

# Add validation
# server/middleware/validation.js (add new validation rules)

# Test locally
npm --prefix server test
npm --prefix server run test:watch
```

#### 2. Frontend Feature

```bash
# Create feature branch
git checkout -b feature/profile-page

# Create component
# client/src/pages/Profile.jsx

# Create component test
# client/src/pages/Profile.test.jsx

# Add route in App.jsx
# <Route path="/profile" element={<Profile />} />

# Test locally
npm --prefix client test
npm --prefix client run test:ui
```

## Code Standards

### JavaScript/Node.js

```javascript
// ✅ GOOD - Clear, descriptive names
async function loginUser(email, password) {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('User not found');
  }
  // ...
}

// ❌ BAD - Unclear abbreviations
async function loginU(e, p) {
  const u = await User.findOne({ email: e });
  // ...
}

// ✅ GOOD - Error handling
try {
  const result = await api.post('/login', credentials);
  return result.data;
} catch (error) {
  logger.error('Login failed:', error);
  throw new AppError(error.message, error.status);
}

// ❌ BAD - Silent failures
const result = await api.post('/login', credentials);
return result;
```

### React

```javascript
// ✅ GOOD - Proper hook usage
function LoginForm() {
  const { login, error, loading } = useAuth();
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    // ...
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* JSX */}
    </form>
  );
}

// ❌ BAD - Direct API calls in component
function BadLoginForm() {
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    const response = await axios.post('/api/auth/login', {
      email,
      password
    });
    // ...
  };
}

// ✅ GOOD - Proper exports
export { LoginForm };
export default LoginForm;

// ❌ BAD - Default export only
export default LoginForm;
```

### Comments

```javascript
// ✅ GOOD - Explain why, not what
// Use hashing to prevent plaintext password storage
const hashedPassword = await bcrypt.hash(password, 10);

// ✅ GOOD - Document complex logic
/**
 * Validates email format and checks uniqueness in database
 * @param {string} email - User email
 * @returns {Promise<boolean>} True if valid and unique
 */
async function validateEmail(email) {
  // ...
}

// ❌ BAD - Obvious comments
// Set name to John
const name = 'John';

// ❌ BAD - Outdated comments
// TODO: Fix this bug from 2024
// This function is broken and needs rewrite
```

### File Naming

- **Components:** PascalCase (LoginForm.jsx)
- **Utilities:** camelCase (errorHandler.js)
- **Tests:** Add `.test.js` suffix (loginForm.test.js)
- **Styles:** Match component name (LoginForm.css)

### Import Ordering

```javascript
// 1. External dependencies
import React, { useState } from 'react';
import axios from 'axios';

// 2. Internal imports
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';

// 3. Styles
import './LoginForm.css';
```

## Git Workflow

### Branch Naming

```
feature/user-profile         # New feature
bugfix/login-validation      # Bug fix
hotfix/security-issue        # Production hotfix
docs/api-documentation       # Documentation
test/auth-flow               # Tests
refactor/error-handling      # Code refactoring
```

### Commit Messages

Follow Conventional Commits format:

```
feat: add user profile page
fix: correct email validation regex
docs: update API documentation
test: add auth middleware tests
refactor: simplify error handling
chore: update dependencies
```

### Pull Request Process

```bash
# 1. Create feature branch
git checkout -b feature/my-feature

# 2. Make changes and test
npm test  # Ensure all tests pass

# 3. Commit with clear messages
git add .
git commit -m "feat: add new feature"

# 4. Push to your fork
git push origin feature/my-feature

# 5. Create Pull Request on GitHub
# - Describe changes clearly
# - Reference related issues
# - Ensure all tests pass
# - Request reviewers
```

## Debugging

### Server Debugging

```bash
# Enable debug mode
DEBUG=* npm run dev

# Use Node debugger
node --inspect server/app.js
# Then open chrome://inspect in Chrome
```

### Frontend Debugging

```bash
# Use React DevTools Chrome extension
# 1. Install React DevTools extension
# 2. Open DevTools (F12)
# 3. Go to Components tab

# Or use Vue DevTools:
# Similar to React DevTools, install extension

# Console debugging
console.log('Debug:', variable);
console.table(arrayOfObjects);
console.group('Group Name');
```

### Common Issues

#### Port Already in Use

```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>

# Or use different port
PORT=5001 npm run dev
```

#### MongoDB Connection Failed

```bash
# Check if MongoDB is running
mongosh

# If not running, start it
# macOS with Homebrew
brew services start mongodb-community

# Windows
net start MongoDB

# Or use MongoDB Atlas cloud instead
# Update MONGO_URI in .env
```

#### Tests Failing

```bash
# Clear Jest cache
npm --prefix server test -- --clearCache
npm --prefix client test -- --clearCache

# Run specific test
npm --prefix server test -- middleware/auth

# Run with verbose output
npm --prefix server test -- --verbose
```

## Performance

### Frontend Optimization

```javascript
// ✅ GOOD - Lazy load components
const Profile = React.lazy(() => import('./pages/Profile'));

// ✅ GOOD - Memoize expensive components
const UserCard = React.memo(({ user }) => (
  <div>{user.name}</div>
));

// ✅ GOOD - Use useCallback for callbacks
const handleClick = useCallback(() => {
  doSomething();
}, [dependency]);
```

### Backend Optimization

```javascript
// ✅ GOOD - Index frequently queried fields
userSchema.index({ email: 1 });

// ✅ GOOD - Select only needed fields
User.findById(id).select('name email');

// ✅ GOOD - Cache frequently accessed data
const cachedUser = cache.get(userId) || 
  await User.findById(userId);
```

### Monitoring Performance

```bash
# Frontend metrics
npm --prefix client run build
# Analyze bundle size with analysis

# Backend metrics
npm --prefix server test -- --coverage
# Check test coverage percentage
```

## Environment Management

### Development (.env)

```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/saas
JWT_SECRET=dev-secret-key
REFRESH_TOKEN_SECRET=dev-refresh-secret-key
```

### Production (.env)

```
NODE_ENV=production
PORT=3000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
JWT_SECRET=<strong-production-secret>
REFRESH_TOKEN_SECRET=<strong-production-secret>
SMTP_HOST=smtp.sendgrid.net
```

### Never Commit

- `.env` files with real credentials
- `node_modules/` directory
- `.cache/` or build artifacts
- API keys or tokens
- Database backups

Add to `.gitignore`:

```
.env
.env.local
node_modules/
dist/
coverage/
.DS_Store
```

## IDE Configuration

### VS Code settings.json

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.exclude": {
    "node_modules": true
  }
}
```

## Continuous Learning

- Read the [Architecture Documentation](./ARCHITECTURE.md)
- Study existing code patterns
- Review Pull Requests and comments
- Participate in code reviews
- Keep dependencies updated

---

**Last Updated:** June 2026  
**Version:** 1.0.0

For questions, open an issue or check existing discussions!
