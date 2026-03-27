# MERN-SaaS-Boilerplate

This repository provides a starting point for a MERN-stack SaaS application with complete authentication flows including registration, email verification, login, and password reset. Protected routes and JWT middleware secure the backend.

## Setup

### Server

1. `cd server` and install dependencies: `npm install`
2. Copy `.env.example` to `.env` and update with your values:
   ```bash
   cp .env.example .env
   ```
   Key variables:
   - `MONGO_URI` – MongoDB connection string
   - `JWT_SECRET` – Secret key for signing tokens
   - `SMTP_*` – Email service config (optional, logs to console if not set)
3. Start: `node app.js` or use `nodemon app.js`

### Client

1. `cd client` and run `npm install`
2. `npm run dev` to start Vite dev server (proxies `/api` to `http://localhost:5000`)

## API Routes

### Authentication (public)
- `POST /api/auth/register` – Sign up (sends verification email)
- `POST /api/auth/login` – Login (requires verified email)
- `GET /api/auth/verify-email?token=...` – Verify email from link
- `POST /api/auth/forgot-password` – Request password reset email
- `POST /api/auth/reset-password` – Reset password with token

### Protected (requires JWT token in `Authorization: Bearer <token>` header)
- `GET /api/auth/me` – Get current user info
- `POST /api/auth/logout` – Logout

## Frontend Pages

- `/login` – Login form
- `/signup` – Registration form
- `/forgot-password` – Password reset request
- `/reset-password?token=...` – Set new password
- `/verify?token=...` – Email verification (auto-triggered)
- `/dashboard` – Protected user dashboard (redirects to `/login` if not authenticated)

## Features

✅ Email verification on signup  
✅ Password reset flow  
✅ JWT-based authentication  
✅ Protected routes with middleware  
✅ User dashboard with logout  
✅ CORS enabled for local dev  
✅ Material-UI components for polished UI  
✅ Comprehensive input validation (client & server)  ' Rate limiting on authentication endpoints
' Role-based user model (user/admin)
## Next Steps

- Create HTML email templates
- Add user profile update endpoint
- Set up tests (Jest, React Testing Library)
- Add password strength meter
- Implement admin routes with role-based access
