# Tutorial: End-to-End Platform Quickstart

This tutorial walks through booting the entire SaaS Pro platform from scratch, provisioning a local database, registering an operator identity, and verifying the protected Obsidian Bento dashboard.

---

## Prerequisites

Before starting, verify your environment meets the minimum version requirements:

```bash
node -v   # Expected: v20.x or higher
npm -v    # Expected: v10.x or higher
mongod --version # Expected: v7.x or higher (or an active MongoDB Atlas URI)
```

---

## Step 1: Install Dependencies

Execute the top-level installation script to configure the root, client, and server workspaces:

```bash
npm run install:all
```

**Expected Output:**
```
added 620 packages, and audited 621 packages in 18s
found 0 vulnerabilities
```

---

## Step 2: Configure Environment Variables

Generate a local `.env` file for the backend server:

```bash
# On Linux / macOS / Git Bash:
cp server/.env.example server/.env

# On Windows PowerShell:
Copy-Item server/.env.example server/.env
```

Open [`server/.env`](file:///c:/Users/Admin/OneDrive/Desktop/Source%20Code/MERN%20SaaS%20Boiler-Plate/server/.env) and ensure the following keys are populated:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/saas
JWT_SECRET=super_secret_cryptographic_jwt_key_at_least_32_characters_long
REFRESH_TOKEN_SECRET=super_secret_refresh_key_at_least_32_characters_long
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

---

## Step 3: Boot the Full-Stack Application

Launch both client and server development servers concurrently:

```bash
npm run dev
```

**Expected Output:**
```
[0] [server] Server running on port 5000
[1] [client]   VITE v7.1.2  ready in 420 ms
[1] [client]   ➜  Local:   http://localhost:5173/
```

- **Frontend Client UI**: [`http://localhost:5173`](http://localhost:5173)
- **Backend API Gateway**: [`http://localhost:5000`](http://localhost:5000)

---

## Step 4: Verify API Gateway Health

In a separate terminal, dispatch a health check query:

```bash
curl http://localhost:5000/api/health
```

**Expected Output:**
```json
{"status":"healthy","timestamp":"2026-10-12T19:00:00.000Z","dbConnected":true}
```

---

## Step 5: Complete Authentication Flow

### A. Register an Operator Account

Dispatch a registration request via `curl`:

```bash
curl -X POST "http://localhost:5000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alex Mercer",
    "email": "operator@company.com",
    "password": "SecurePassword123!"
  }'
```

**Expected Output:**
```json
{
  "success": true,
  "message": "User registered successfully. Please check your email to verify your account."
}
```

### B. Verify the Account (Development Mode)

In development mode when SMTP credentials are not configured, the verification URL is emitted directly to the server terminal:

```
[server] Verification URL: http://localhost:5000/api/auth/verify-email?token=<TOKEN>
```

Execute a GET request with that verification URL or paste it into your browser:

```bash
curl "http://localhost:5000/api/auth/verify-email?token=<TOKEN>"
```

**Expected Output:**
```json
{
  "success": true,
  "message": "Email verified successfully. You may now log in."
}
```

### C. Log In & Receive Session Cookies

Log in to generate your session:

```bash
curl -X POST "http://localhost:5000/api/auth/login" \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "operator@company.com",
    "password": "SecurePassword123!"
  }'
```

**Expected Output:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "670c56b8f1d2e3b4a5678901",
      "name": "Alex Mercer",
      "email": "operator@company.com",
      "role": "admin"
    }
  }
}
```

### D. Verify Protected Route Access

Retrieve your profile using the cookie session:

```bash
curl -X GET "http://localhost:5000/api/auth/me" -b cookies.txt
```

**Expected Output:**
```json
{
  "success": true,
  "data": {
    "_id": "670c56b8f1d2e3b4a5678901",
    "name": "Alex Mercer",
    "email": "operator@company.com",
    "role": "admin",
    "verified": true
  }
}
```

---

## Step 6: Run Automated Tests

Assert system integrity by executing the full automated test suite:

```bash
# Execute Client Vitest tests (15 unit & component tests)
npm test --prefix client -- --run

# Execute Server Jest tests (8 schema & error handling tests)
npm test --prefix server -- --runInBand
```

**Expected Output:**
```
Test Files  3 passed (3)
Tests       15 passed (15)

Test Suites: 2 passed, 2 total
Tests:       8 passed, 8 total
```

You now have a fully operational local instance of the SaaS Pro platform.
