# Contributing to MERN SaaS Boilerplate

Thank you for your interest in contributing! This document provides comprehensive guidelines for contributing to this project. Whether you're reporting bugs, suggesting features, or submitting code, we appreciate your involvement.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Git Workflow](#git-workflow)
- [Pull Request Process](#pull-request-process)
- [Code Review Guidelines](#code-review-guidelines)
- [Asking Questions](#asking-questions)

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors. We expect all participants to:

- Be respectful and inclusive
- Welcome newcomers and help them
- Focus on constructive criticism
- Report unacceptable behavior to maintainers

### Our Standards

Examples of behavior that creates a positive environment:
- Using welcoming and inclusive language
- Being respectful of differing opinions and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

Examples of unacceptable behavior:
- Harassment or discrimination
- Offensive comments or language
- Personal attacks
- Public or private harassment
- Publishing private information without consent

## How to Contribute

### 1. Reporting Bugs

Before reporting a bug, please:

**Search existing issues** - Your bug may have already been reported.

**Provide a detailed report:**

```markdown
**Title:** [Brief description of bug]

**Environment:**
- OS: Windows 10 / macOS / Ubuntu
- Node.js version: 18.0.0
- npm version: 8.0.0
- Browser (if frontend): Chrome 120

**Description:**
Clear description of what happened and what you expected.

**Steps to Reproduce:**
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happens

**Screenshots/Logs:**
Relevant error messages or screenshots

**Additional Context:**
Any other information that might help
```

### 2. Suggesting Enhancements

Provide clear and detailed suggestions:

```markdown
**Title:** [Enhancement: Clear title]

**Description:**
Clear description of the enhancement

**Use Case:**
Why is this useful? Who benefits?

**Example/Mock-up:**
If applicable, provide examples or mock-ups

**Related Issues:**
Link to related issues if any

**Alternatives Considered:**
Other solutions you've thought about
```

### 3. Submitting Code Changes

## Development Setup

### Prerequisites

- **Node.js** 16.0 or higher
- **npm** 8.0 or higher
- **Git** latest version
- **MongoDB** (local or MongoDB Atlas)

### Initial Setup

```bash
# 1. Fork the repository on GitHub
# https://github.com/BradleyXiX/MERN-SaaS-Boilerplate/fork

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/MERN-SaaS-Boilerplate.git
cd MERN-SaaS-Boilerplate

# 3. Add upstream remote (to keep your fork synced)
git remote add upstream https://github.com/BradleyXiX/MERN-SaaS-Boilerplate.git

# 4. Install dependencies
npm run install:all

# 5. Setup environment
cp server/.env.example server/.env
cp client/.env.example client/.env

# 6. Edit server/.env with your values
# At minimum: MONGO_URI, JWT_SECRET, REFRESH_TOKEN_SECRET
```

### Verify Setup

```bash
# Verify dependencies installed
npm --prefix server list
npm --prefix client list

# Start development servers
npm run dev

# In another terminal, run tests
npm test

# All should work without errors
```

## Making Changes

### Choose What to Work On

1. **Pick an issue** - Look for issues labeled `good-first-issue` or `help-wanted`
2. **Assign yourself** - Comment on the issue to let others know you're working on it
3. **Ask questions** - If unclear, ask in the issue before starting

### Branch Naming

Follow branch naming conventions:

```
feature/user-authentication     # New feature
bugfix/login-validation        # Bug fix
hotfix/security-vulnerability  # Emergency fix
docs/api-documentation         # Documentation
refactor/code-cleanup          # Code refactoring
test/add-unit-tests            # New tests
chore/update-dependencies      # Maintenance
```

### Code Standards

#### General Principles

- **Keep it Simple** - Write clear, maintainable code
- **DRY** - Don't Repeat Yourself
- **Meaningful Names** - Use descriptive variable and function names
- **Comments** - Explain why, not what
- **Small Functions** - Each function should do one thing well

#### JavaScript/Node.js

```javascript
// ✅ Good - Clear naming and structure
function validateUserEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ❌ Avoid - Unclear abbreviations
function validateEmail(e) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

// ✅ Good - Proper error handling
async function loginUser(email, password) {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError('User not found', 404);
    }
    // ... rest of logic
  } catch (error) {
    logger.error('Login error:', error);
    throw error;
  }
}

// ✅ Good - Use async/await, avoid callback hell
async function fetchUserData(userId) {
  const user = await User.findById(userId);
  const posts = await Post.find({ userId });
  return { user, posts };
}
```

#### React Components

```javascript
// ✅ Good - Proper hook usage and component structure
function UserProfile() {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div>
      <h1>{user.name}</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

// ❌ Avoid - Direct API calls in component
function BadProfile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios.get('/api/users/me').then(res => {
      setUser(res.data);
    });
  }, []);
  // ...
}
```

## Testing

### Testing Requirements

- All new features must include tests
- All bug fixes should include tests
- Minimum 80% code coverage
- All tests must pass before PR

### Running Tests

```bash
# Run all tests
npm test

# Server tests
npm --prefix server test

# Client tests
npm --prefix client test

# Watch mode (auto-rerun on changes)
npm --prefix server test -- --watch
npm --prefix client test -- --watch

# Coverage report
npm --prefix server run test:coverage
npm --prefix client run test:coverage
```

### Writing Tests

**Server (Jest):**

```javascript
describe('authController', () => {
  describe('loginUser', () => {
    it('should return tokens on successful login', async () => {
      const mockUser = {
        _id: '123',
        email: 'test@example.com',
        password: 'hashed',
        verified: true
      };

      User.findOne = jest.fn().mockResolvedValue(mockUser);
      // ... test implementation
    });

    it('should reject unverified users', async () => {
      const mockUser = {
        ...mockUser,
        verified: false
      };

      User.findOne = jest.fn().mockResolvedValue(mockUser);
      // ... expect error
    });
  });
});
```

**Client (Vitest):**

```javascript
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../hooks/useAuth';

describe('useAuth hook', () => {
  it('should provide login function', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });

    expect(typeof result.current.login).toBe('function');
  });

  it('should handle login error', async () => {
    // ... test implementation
  });
});
```

## Git Workflow

### Commit Messages

Use Conventional Commits format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Code style (formatting, missing semicolons)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance, dependencies
- `perf:` - Performance improvements
- `ci:` - CI/CD changes

**Examples:**

```bash
# Feature
git commit -m "feat(auth): add two-factor authentication"

# Bug fix
git commit -m "fix(email): resolve verification token expiry issue"

# Multiple lines
git commit -m "feat(dashboard): add user analytics

- Add total users chart
- Add revenue metrics
- Add conversion rate tracking"

# Reference issue
git commit -m "fix(auth): resolve 401 on page refresh (fixes #123)"
```

### Keeping Your Fork Updated

```bash
# Fetch latest from upstream
git fetch upstream

# Rebase your branch
git rebase upstream/main

# Force push if needed (only if you're alone on the branch)
git push --force-with-lease origin your-branch
```

## Pull Request Process

### Before Creating PR

1. **Pull latest changes**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run all tests**
   ```bash
   npm test
   npm --prefix server run test:coverage
   npm --prefix client run test:coverage
   ```

3. **Run linter**
   ```bash
   npm --prefix client run lint
   ```

4. **Verify no console errors**
   - Check browser console (F12)
   - Check server logs

### Create PR

**PR Title Format:**
```
[Type] Brief description of changes
```

Examples:
- `[Feature] Add password strength meter`
- `[Fix] Resolve JWT token expiration bug`
- `[Docs] Update API documentation`

**PR Description Template:**

```markdown
## Description
Brief description of what this PR does

## Related Issue
Fixes #123

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Documentation update
- [ ] Code refactoring

## Changes Made
- Point 1
- Point 2
- Point 3

## How to Test
Steps to test the changes:
1. Step 1
2. Step 2
3. Step 3

## Screenshots/Videos
If applicable, add screenshots or videos

## Checklist
- [ ] All tests pass (`npm test`)
- [ ] New tests added for new features
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings generated
```

### PR Review Process

1. **Automated checks run**
   - Tests must pass
   - Coverage maintained
   - Linting passes

2. **Maintainers review**
   - Code quality review
   - Architecture review
   - Testing review

3. **Respond to feedback**
   - Address all comments
   - Push new commits (don't force push)
   - Request re-review when ready

4. **Merge**
   - Squash commits if requested
   - Delete branch after merge

## Code Review Guidelines

### For Contributors

When your PR is being reviewed:

1. **Be receptive** - Feedback is constructive
2. **Respond promptly** - Address comments within reasonable time
3. **Ask for clarification** - If feedback is unclear
4. **Update accordingly** - Make requested changes
5. **Request re-review** - After making changes

### For Reviewers

When reviewing others' PRs:

1. **Be respectful** - Focus on code, not person
2. **Be constructive** - Suggest improvements
3. **Acknowledge good work** - Point out what works well
4. **Ask questions** - Help understand intent
5. **Consider context** - Review full PR, not just lines

**Example feedback:**

```markdown
// Good feedback
"This approach works, but I think we could improve performance by using useMemo here. Have you considered that?"

// Feedback to avoid
"This code is bad. Rewrite it."
```

## Asking Questions

### Before Contributing

- **Read documentation** - Check [README.md](./README.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [DEVELOPMENT.md](./DEVELOPMENT.md)
- **Search issues** - Your question might be answered already
- **Check discussions** - Use GitHub Discussions

### Ask in Issues

- Be specific about your question
- Provide relevant code/error messages
- Explain what you've already tried
- Be patient - maintainers volunteer their time

### Discord/Chat (if available)

- Join community chat for quick questions
- Use threads to keep conversations organized
- Be respectful of others' time

## Recognition

Contributors are recognized in:
- [CONTRIBUTORS.md](./CONTRIBUTORS.md) (add yourself!)
- Release notes
- GitHub contributors page

## Licensing

By contributing, you agree that your contributions will be licensed under the MIT License.

## Additional Resources

- [Development Guide](./DEVELOPMENT.md)
- [Testing Guide](./TESTING.md)
- [Architecture Documentation](./ARCHITECTURE.md)
- [API Documentation](./API.md)

## Need Help?

- Read existing documentation
- Search existing issues and discussions
- Ask in a new GitHub issue
- Check project discussions

---

**Thank you for contributing! Your efforts make this project better for everyone.**

**Version:** 1.0.0  
**Last Updated:** June 2026
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
