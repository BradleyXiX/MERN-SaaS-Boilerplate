# SaaS Pro — Platform Development Guide

Authoritative technical developer guide for environment configuration, code conventions, debugging workflows, and testing protocols.

---

## 1. System Requirements & Tooling

- **Node.js**: `≥ 20.0.0` (LTS recommended)
- **npm**: `≥ 10.0.0`
- **MongoDB**: `≥ 7.0` (Local daemon or MongoDB Atlas cluster)
- **Editor**: VS Code with recommended extensions: ESLint, Prettier, Error Lens, Tailwind CSS IntelliSense

---

## 2. Daily Development Workflows

### Bootstrap Workspace

```bash
# Clone repository
git clone https://github.com/BradleyXiX/MERN-SaaS-Boilerplate.git
cd MERN-SaaS-Boilerplate

# Install dependencies across root, server, and client workspaces
npm run install:all

# Configure environment variables
cp server/.env.example server/.env
```

### Launch Development Servers

```bash
# Starts Express gateway (port 5000) and Vite client (port 5173) concurrently
npm run dev
```

### Execute Test Suites

```bash
# Run Client Vitest tests (single run)
npm test --prefix client -- --run

# Run Client Vitest tests in interactive watch mode
npm test --prefix client

# Run Server Jest test suite (in band)
npm test --prefix server -- --runInBand
```

---

## 3. Project Directory Architecture

```
MERN-SaaS-Boilerplate/
├── .agents/                      # Agent Orchestrator specifications & skills
├── docs/                         # Diátaxis Framework Documentation
│   ├── tutorials/                # Learning-oriented guides (Quickstart)
│   ├── how-to/                   # Task-oriented recipes (Deployment, Auth, Testing)
│   ├── reference/                # Information-oriented specs (API, Config)
│   ├── explanation/              # Understanding-oriented architecture (Security, WebGL)
│   └── adr/                      # Architecture Decision Records (001, 002, 003)
├── client/                       # Frontend Presentation Tier (React 19 + Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── motion/           # CustomCursor, MagneticButton (GSAP)
│   │   │   ├── webgl/            # HeroWebGLCanvas, ParticleConstellation (Three.js/R3F)
│   │   │   └── ProtectedRoute.jsx# Auth boundary route guard
│   │   ├── contexts/             # AuthContext (HttpOnly session state)
│   │   ├── hooks/                # useAuth custom hook
│   │   ├── lib/                  # smooth-scroll.js (Lenis + GSAP ticker)
│   │   ├── pages/                # Landing, Login, Signup, Dashboard, Verify, Password
│   │   └── utils/                # api.js (Axios withCredentials), errorHandler.js
│   ├── package.json
│   └── vite.config.js
├── server/                       # Backend Gateway Tier (Express 5 + MongoDB)
│   ├── controllers/              # authController.js (Business logic)
│   ├── middleware/               # zodValidator, rateLimiter, auth, errorHandler
│   ├── models/                   # User.js (Mongoose schema)
│   ├── routes/                   # auth.js (Route mounting & validation pipelines)
│   ├── utils/                    # cookieHelper, tokenService, mailer, logger
│   └── app.js                    # Express app initialization & Helmet CSP
├── package.json                  # Top-level workspace script definitions
├── API.md                        # Authoritative REST API reference contract
├── ARCHITECTURE.md               # System architecture and data flow specification
├── DEPLOYMENT.md                 # Production deployment recipes
└── TESTING.md                    # Testing guide and assertion patterns
```

---

## 4. Code Standards & Defensive Boundaries

### Defensive Input Verification (Zod)
Never parse untyped user input in controllers. All routes must be protected by Zod schemas in [`server/middleware/zodValidator.js`](file:///c:/Users/Admin/OneDrive/Desktop/Source%20Code/MERN%20SaaS%20Boiler-Plate/server/middleware/zodValidator.js). All failures must emit standard RFC 7807 Problem Details.

### Zero-AI-Slop Aesthetics
Frontend layouts must adhere to the Obsidian Bento design system:
- **Palette**: Use `#090B10` for root canvas, `#0F131C` for bento panels, hairline borders `rgba(255, 255, 255, 0.07)`, and electric cyan (`#06B6D4`) or amber (`#F59E0B`) accents.
- **Typography**: Pair `Outfit` display headings with `Plus Jakarta Sans` body and `JetBrains Mono` telemetry.
- **Motion**: Bind all scroll-scrubbed motion through `lenis` and `gsap.ticker`. Ensure clean lifecycle teardown with `useGSAP()`.

---

## 5. Debugging Recipes

### Testing HttpOnly Cookies via `curl`

Store and replay cookies using `-c` (cookie jar) and `-b` (cookie file):

```bash
# 1. Login and write cookies to jar:
curl -X POST "http://localhost:5000/api/auth/login" \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"operator@company.com","password":"SecurePassword123!"}'

# 2. Access protected endpoint reading cookies from jar:
curl -X GET "http://localhost:5000/api/auth/me" -b cookies.txt

# 3. View saved cookies:
cat cookies.txt
```

### Simulating Rate Limiting Bursts

To verify rate limiting thresholds, dispatch rapid requests:

```bash
for i in {1..7}; do
  curl -s -o /dev/null -w "%{http_code}\n" -X POST "http://localhost:5000/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
done
```
The first 5 requests will return `401` or `422`, and requests 6 and 7 will return `429 Too Many Requests`.
