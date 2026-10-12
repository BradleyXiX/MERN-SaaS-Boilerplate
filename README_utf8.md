# MERN SaaS Boilerplate

> A production-ready, enterprise-grade MERN (MongoDB, Express, React, Node.js) SaaS application boilerplate with complete authentication flows, testing infrastructure, and modern development practices.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/Node.js-%3E%3D16.0-blue)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/React-%3E%3D19.0-blue)](https://reactjs.org/)

## 📋 Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Documentation](#documentation)
- [Tech Stack](#tech-stack)
- [Getting Help](#getting-help)
- [License](#license)

## ✨ Features

### Authentication & Security
- ✅ **Secure Registration** - Email verification with token validation
- ✅ **JWT Authentication** - Access tokens (15m) + Refresh tokens (7 days)
- ✅ **Password Management** - Secure hashing (bcryptjs) and reset flows
- ✅ **Rate Limiting** - Protection against brute force attacks
- ✅ **CORS Support** - Configured for local development and production
- ✅ **Security Headers** - Helmet.js for HTTP security

### Frontend
- ✅ **React 19** with Vite for fast development
- ✅ **Material-UI (MUI)** - Professional component library
- ✅ **Global State Management** - React Context API with auth state
- ✅ **Protected Routes** - Automatic redirection for unauthorized access
- ✅ **Responsive Design** - Mobile-first approach
- ✅ **Error Handling** - Centralized error management with user feedback

### Backend
- ✅ **Express.js Framework** - Minimal, flexible Node.js server
- ✅ **MongoDB with Mongoose** - Document database with schema validation
- ✅ **Comprehensive Validation** - Input validation on client and server
- ✅ **Professional Logging** - Winston logger integration
- ✅ **Error Handling** - Global error middleware with proper status codes
- ✅ **Email Service** - Nodemailer integration (Gmail, SendGrid, etc.)

### Development & Testing
- ✅ **Jest Testing** - Comprehensive server-side testing
- ✅ **Vitest Testing** - Fast React component testing
- ✅ **Code Coverage** - Track test coverage metrics
- ✅ **Git Hooks** - Pre-commit setup ready (Husky)
- ✅ **ESLint Configuration** - Code quality enforcement
- ✅ **Hot Module Reloading** - Vite's fast refresh

## 🚀 Quick Start

### Prerequisites

- **Node.js** 16.0 or higher
- **npm** 8.0 or higher
- **MongoDB** 5.0 or higher (local or MongoDB Atlas)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/BradleyXiX/MERN-SaaS-Boilerplate.git
cd MERN-SaaS-Boilerplate

# 2. Install all dependencies
npm run install:all

# 3. Configure environment variables
cp server/.env.example server/.env
cp client/.env.example client/.env

# 4. Edit server/.env with your MongoDB and email settings
# Required: MONGO_URI, JWT_SECRET, REFRESH_TOKEN_SECRET
# Optional: SMTP_* for email functionality

# 5. Start development servers
npm run dev

# Frontend will be available at: http://localhost:5173
# Backend will be available at: http://localhost:5000
```

### First Login

The application comes with email verification. For testing:

1. Register with any email address
2. Check server console for verification link (if SMTP not configured)
3. Use the verification token to complete signup
4. Login with your credentials

## 📁 Project Structure

```
MERN-SaaS-Boilerplate/
├── client/                          # React frontend
│   ├── src/
│   │   ├── components/              # Reusable React components
│   │   ├── contexts/                # Global state (AuthContext)
│   │   ├── hooks/                   # Custom hooks (useAuth)
│   │   ├── pages/                   # Page components (Login, Signup, etc.)
│   │   ├── utils/                   # Utilities (api client, error handlers)
│   │   ├── App.jsx                  # Main App component
│   │   └── main.jsx                 # React entry point
│   ├── vitest.config.js             # Vitest configuration
│   ├── vitest.setup.js              # Test setup
│   └── package.json
│
├── server/                          # Express backend
│   ├── controllers/                 # Business logic (authController)
│   ├── middleware/                  # Express middleware
│   │   ├── auth.js                  # JWT verification
│   │   ├── errorHandler.js          # Global error handling
│   │   ├── rateLimiter.js           # Rate limiting
│   │   └── validation.js            # Input validation
│   ├── models/                      # Mongoose schemas (User)
│   ├── routes/                      # API routes
│   ├── utils/                       # Utilities
│   │   ├── tokenService.js          # Token generation/verification
│   │   ├── logger.js                # Winston logger
│   │   ├── mailer.js                # Email sending
│   │   └── templates/               # Email templates
│   ├── app.js                       # Express app setup
│   ├── jest.config.js               # Jest configuration
│   ├── jest.setup.js                # Test setup
│   └── package.json
│
├── shared/                          # Shared utilities (future)
│
├── ARCHITECTURE.md                  # System architecture
├── CONTRIBUTING.md                  # Contribution guidelines
├── DEVELOPMENT.md                   # Development guide
├── API.md                           # API documentation
├── TESTING.md                       # Testing guide
├── REFRESH_TOKEN_GUIDE.md           # Token strategy
├── DEPLOYMENT.md                    # Deployment guide
└── README.md                        # This file
```

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System design, data flow, and component interactions |
| [API.md](./API.md) | Complete API endpoint reference with examples |
| [DEVELOPMENT.md](./DEVELOPMENT.md) | Development setup, workflow, and best practices |
| [TESTING.md](./TESTING.md) | Testing strategy, running tests, and writing tests |
| [REFRESH_TOKEN_GUIDE.md](./REFRESH_TOKEN_GUIDE.md) | Token lifecycle and refresh mechanism |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Production deployment and environment setup |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Contribution guidelines and PR process |

## 🛠 Tech Stack

### Frontend
- **React** 19.1 - UI library
- **Vite** 7.1 - Build tool and dev server
- **Material-UI** 5.14 - Component library
- **React Router** 6.14 - Client-side routing
- **Axios** 1.11 - HTTP client
- **Vitest** - Unit testing framework
- **Testing Library** - React component testing

### Backend
- **Node.js** - JavaScript runtime
- **Express** 5.2 - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** 9.3 - ODM library
- **JWT** 9.0 - Token generation
- **bcryptjs** 3.0 - Password hashing
- **Nodemailer** 6.9 - Email sending
- **Winston** 3.19 - Logging
- **Jest** 29.7 - Unit testing
- **Helmet** 8.1 - Security headers

## 🔐 Security Features

- ✅ Password hashing with bcryptjs (10 salt rounds)
- ✅ JWT tokens with short expiration (15 minutes)
- ✅ Refresh tokens stored hashed in database (7 day expiry)
- ✅ Rate limiting on authentication endpoints
- ✅ CORS validation
- ✅ Input validation and sanitization
- ✅ Security headers via Helmet.js
- ✅ Environment variables for sensitive data
- ✅ Protected API routes with auth middleware

## 📦 Available Scripts

### Development

```bash
# Start both frontend and backend in parallel
npm run dev

# Start only server (from server directory)
cd server && npm run dev

# Start only client (from client directory)
cd client && npm run dev
```

### Testing

```bash
# Run all tests
npm test

# Run tests for specific package
npm --prefix server test
npm --prefix client test

# Run with coverage
npm --prefix server run test:coverage
npm --prefix client run test:coverage
```

### Building

```bash
# Build for production
npm --prefix client run build

# Preview production build
npm --prefix client run preview
```

### Code Quality

```bash
# Lint client code
npm --prefix client run lint
```

## 🐛 Troubleshooting

### MongoDB Connection Failed
- Ensure MongoDB is running locally or MongoDB Atlas is accessible
- Check `MONGO_URI` in server/.env
- Verify network connectivity and credentials

### Email Verification Not Working
- Ensure `SMTP_*` variables are configured in server/.env
- Check application logs for email errors
- For development, verification links are logged to console

### Frontend Can't Connect to Backend
- Verify backend is running on http://localhost:5000
- Check `VITE_API_BASE_URL` in client/.env
- Look for CORS errors in browser console

### Tests Failing
- Run `npm run install:all` to ensure dependencies are fresh
- Check Node.js version: `node --version` (should be 16+)
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`

## 📞 Getting Help

### Documentation
- Read the comprehensive docs in the repository
- Check existing GitHub issues for solutions
- Review error logs in server console

### Reporting Issues
- Search existing issues first to avoid duplicates
- Provide: Error message, steps to reproduce, environment details
- Include relevant code snippets and logs

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Quick Contribution Steps
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and write tests
4. Commit with clear messages: `git commit -m 'feat: add amazing feature'`
5. Push to your fork: `git push origin feature/amazing-feature`
6. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- Built with industry best practices
- Inspired by modern SaaS applications
- Thanks to all contributors and maintainers

## 📈 Roadmap

Future enhancements planned:
- [ ] OAuth2 integration (Google, GitHub)
- [ ] Two-factor authentication (2FA)
- [ ] Advanced role-based access control (RBAC)
- [ ] User profile management
- [ ] Payment integration (Stripe)
- [ ] Admin dashboard
- [ ] Docker configuration
- [ ] CI/CD pipeline

---

**Version:** 1.0.0  
**Last Updated:** June 2026  
**Maintainer:** BradleyXiX

For the latest updates, visit [GitHub Repository](https://github.com/BradleyXiX/MERN-SaaS-Boilerplate)
