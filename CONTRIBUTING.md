# Contributing to MERN-SaaS-Boilerplate

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to this project.

## 🎯 How to Contribute

### Reporting Bugs

1. **Check existing issues** to avoid duplicates
2. **Create a new issue** with:
   - Clear, descriptive title
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, Node version, etc.)
   - Screenshots/error logs if applicable

### Suggesting Enhancements

1. **Describe the enhancement** clearly
2. **Explain the use case** and why it's beneficial
3. **Provide examples** of how it might work
4. **Link related issues** if any

### Submitting Pull Requests

#### Setup Your Development Environment

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/MERN-SaaS-Boilerplate.git
cd MERN-SaaS-Boilerplate

# Add upstream remote
git remote add upstream https://github.com/BradleyXiX/MERN-SaaS-Boilerplate.git

# Install dependencies
npm run install:all
```

#### Making Changes

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Follow code standards:**
   - Use meaningful names for variables and functions
   - Write clear comments for complex logic
   - Keep functions small and focused
   - Follow existing code style

3. **Test your changes:**
   - Test the feature manually
   - Test authentication flows if modifying auth
   - Check for console errors
   - Test in both client and server if relevant

4. **Lint your code:**
   ```bash
   # Client
   cd client && npm run lint

   # Fix issues
   npm run lint -- --fix
   ```

#### Commit Guidelines

Use conventional commit messages:

```bash
git commit -m "feat: add two-factor authentication"
git commit -m "fix: resolve email verification token expiry bug"
git commit -m "docs: update API documentation"
git commit -m "refactor: simplify authentication middleware"
git commit -m "test: add tests for password reset"
```

**Commit types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation only
- `refactor:` - Code refactoring without feature changes
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks, dependencies
- `perf:` - Performance improvements

#### Push and Create PR

```bash
# Push to your fork
git push origin feature/your-feature-name

# Create a Pull Request on GitHub
```

**PR Description should include:**
- What changes were made and why
- Related issue number (if applicable)
- Testing performed
- Screenshots/demo (if UI changes)

## 📋 Code Style Guidelines

### Backend (Node.js/Express)

```javascript
// ✅ Good - Clear naming, comments for complexity
function validatePasswordStrength(password) {
  // Passwords must be at least 8 chars with uppercase, lowercase, and number
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return regex.test(password);
}

// ❌ Avoid - Unclear naming
function validatePwd(pwd) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(pwd);
}
```

### Frontend (React)

```javascript
// ✅ Good - Clear component structure
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Handle login logic
  };
  
  return (
    // JSX
  );
}

// ❌ Avoid - Unclear state management
function LoginForm() {
  const [x, setX] = useState('');
  const [y, setY] = useState('');
  // ...
}
```

## 🧪 Testing

While formal test suite is a work in progress, please:

1. **Manual Testing Checklist:**
   - [ ] Feature works as intended
   - [ ] No console errors or warnings
   - [ ] Error handling works correctly
   - [ ] UI responsive on different screen sizes
   - [ ] Authentication flows tested if applicable

2. **For Authentication Changes:**
   - [ ] Registration flow works
   - [ ] Email verification works
   - [ ] Login/logout works
   - [ ] Protected routes work
   - [ ] Token refresh if applicable
   - [ ] Password reset flow works

## 📚 Documentation

Update documentation when:
- Adding/modifying API endpoints → Update `README.md` API section
- Adding new environment variables → Update `.env.example` and docs
- Changing project structure → Update structure section
- Adding new features → Update features list

## 🔍 Before Submitting

1. **Run linter:**
   ```bash
   cd client && npm run lint
   ```

2. **Check for common issues:**
   - No hardcoded secrets
   - No console.log() left in production code
   - No unused imports/variables
   - Consistent error handling

3. **Verify it works:**
   - Clear browser cache
   - Test with fresh `.env`
   - Test in new terminal to verify setup instructions

4. **Sync with upstream:**
   ```bash
   git fetch upstream
   git rebase upstream/main
   git push origin feature/your-feature-name -f
   ```

## 🎓 Project Guidelines

### When to Modify What

**Backend Changes:**
- Add to `controllers/` for business logic
- Add to `middleware/` for request processing
- Add to `utils/` for helper functions
- Update `routes/` for new endpoints
- Update `models/` for schema changes

**Frontend Changes:**
- Add to `components/` for reusable components
- Add to `pages/` for route components
- Add to `hooks/` for custom React hooks
- Add to `utils/` for utility functions

### Security Considerations

- Never commit `.env` files with real secrets
- Validate all inputs on both client and server
- Hash passwords using bcryptjs (already configured)
- Use HTTPS in production
- Set secure JWT secrets (generate with crypto)
- Keep dependencies updated to patch vulnerabilities

## 📞 Questions?

- Ask in issues for clarification
- Check existing issues and PRs for discussions
- Refer to code comments and documentation

## ✅ Checklist Before Submitting PR

- [ ] Follows code style guidelines
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No console.log/debugging code left
- [ ] Tested manually
- [ ] Linter passes (no errors)
- [ ] No hardcoded secrets
- [ ] Commit messages are clear
- [ ] PR description is detailed
- [ ] Related issues are linked

Thank you for contributing! 🎉
