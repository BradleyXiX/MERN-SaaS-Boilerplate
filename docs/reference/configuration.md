# Configuration & Environment Reference

Authoritative technical reference for runtime environment variables, security headers, rate-limiting tiers, and design tokens in the SaaS Pro platform.

---

## 1. Backend Server Environment Variables (`server/.env`)

| Variable | Type | Required | Default | Description | Security Classification |
|---|---|---|---|---|---|
| `PORT` | Integer | No | `5000` | Port on which Express gateway listens. | Public |
| `NODE_ENV` | Enum (`development`, `production`, `test`) | Yes | `development` | Runtime mode. Enables secure cookie flags in production. | Public |
| `MONGO_URI` | URI String | Yes | `mongodb://localhost:27017/saas` | MongoDB connection string (local instance or MongoDB Atlas replica set). | **Confidential Secret** |
| `JWT_SECRET` | String (≥32 chars) | Yes | None | Secret key used to sign and verify access tokens (HMAC-SHA256). | **Critical Secret** |
| `REFRESH_TOKEN_SECRET` | String (≥32 chars) | Yes | None | Secret key used to sign and verify refresh tokens (HMAC-SHA256). | **Critical Secret** |
| `CORS_ALLOWED_ORIGINS` | Comma-delimited URI string | Yes | `http://localhost:5173,http://127.0.0.1:5173` | Explicit whitelist of origins permitted to communicate via credentials. | Internal Config |
| `SMTP_HOST` | Hostname / IP | No | None | Outbound SMTP email host (e.g., `smtp.sendgrid.net`, `smtp.gmail.com`). | Internal Config |
| `SMTP_PORT` | Integer | No | `587` | Outbound SMTP network port (typically `587` for STARTTLS, `465` for SSL). | Internal Config |
| `SMTP_USER` | String | No | None | Outbound SMTP account username or API key identifier. | **Confidential Secret** |
| `SMTP_PASS` | String | No | None | Outbound SMTP account password or API secret key. | **Critical Secret** |
| `SMTP_SECURE` | Boolean | No | `false` | Explicit TLS connection flag for SMTP transport. | Internal Config |

---

## 2. Frontend Client Environment Variables (`client/.env`)

| Variable | Type | Required | Default | Description |
|---|---|---|---|---|
| `VITE_API_BASE_URL` | URI String | No | `""` (Empty string = relative paths) | Base URL prefix for Axios HTTP transport (`client/src/utils/api.js`). In local development with Vite dev server proxying, left blank. |

---

## 3. Cookie Storage & Session Parameters

Managed by [`server/utils/cookieHelper.js`](file:///c:/Users/Admin/OneDrive/Desktop/Source%20Code/MERN%20SaaS%20Boiler-Plate/server/utils/cookieHelper.js):

| Cookie Name | Scope | Max-Age | HttpOnly | Secure | SameSite | Path |
|---|---|---|---|---|---|---|
| `saas_auth_session` | Access Token | 15 minutes (`900,000 ms`) | `true` | `true` (if `NODE_ENV === 'production'`) | `Strict` | `/` |
| `saas_refresh_session` | Refresh Token | 7 days (`604,800,000 ms`) | `true` | `true` (if `NODE_ENV === 'production'`) | `Strict` | `/` |

---

## 4. Gateway Content Security Policy (Helmet)

Configured inside [`server/app.js`](file:///c:/Users/Admin/OneDrive/Desktop/Source%20Code/MERN%20SaaS%20Boiler-Plate/server/app.js):

| Directive | Permitted Sources | Rationale |
|---|---|---|
| `default-src` | `'self'` | Disallow unexpected origin assets. |
| `script-src` | `'self'`, `'unsafe-inline'` | Allow client single-page app bundles. |
| `style-src` | `'self'`, `'unsafe-inline'`, `https://fonts.googleapis.com` | Permit Google Fonts stylesheet and CSS transitions. |
| `font-src` | `'self'`, `https://fonts.gstatic.com` | Permit font bin downloads (Outfit, Plus Jakarta Sans, JetBrains Mono). |
| `img-src` | `'self'`, `data:`, `https:` | Support inline base64 and remote CDN assets. |
| `connect-src` | `'self'`, `http://localhost:5173`, `http://127.0.0.1:5173` | Whitelist local Vite dev server and self origin. |
| `object-src` | `'none'` | Neutralize Flash / ActiveX plugins. |
| `base-uri` | `'self'` | Disallow malicious `<base>` tag injection. |
| `frame-ancestors` | `'none'` | Disallow iframe embedding (Clickjacking mitigation). |

---

## 5. Rate Limiting Sliding Windows

Configured inside [`server/middleware/rateLimiter.js`](file:///c:/Users/Admin/OneDrive/Desktop/Source%20Code/MERN%20SaaS%20Boiler-Plate/server/middleware/rateLimiter.js):

| Limiter Identifier | Max Requests | Window Duration | Target Routes | Action on Breach |
|---|---|---|---|---|
| `apiLimiter` | 10 | 15 minutes (`900,000 ms`) | General API endpoints | HTTP 429 Too Many Requests |
| `authLimiter` | 5 | 15 minutes (`900,000 ms`) | `POST /api/auth/register` | HTTP 429 Too Many Requests |
| `loginLimiter` | 5 | 15 minutes (`900,000 ms`) | `POST /api/auth/login` | HTTP 429 Too Many Requests |
| `passwordResetLimiter` | 3 | 1 hour (`3,600,000 ms`) | `POST /api/auth/forgot-password`, `POST /api/auth/reset-password` | HTTP 429 Too Many Requests |

---

## 6. Frontend Design Tokens & Obsidian Color Foundations

Configured inside [`client/src/index.css`](file:///c:/Users/Admin/OneDrive/Desktop/Source%20Code/MERN%20SaaS%20Boiler-Plate/client/src/index.css):

| Token Name | Hex Value | Semantic Usage |
|---|---|---|
| `--color-obsidian-950` | `#090B10` | Primary viewport background & canvas clear color |
| `--color-obsidian-900` | `#0F131C` | Bento card foundation & elevated surfaces |
| `--color-obsidian-800` | `#161B26` | Hovered card state & secondary interactive layers |
| `--color-obsidian-border` | `rgba(255, 255, 255, 0.07)` | Hairline card separation borders |
| `--color-accent-cyan` | `#06B6D4` | Primary telemetry accent, glowing nodes |
| `--color-accent-amber` | `#F59E0B` | System alert accent, warning status |
| `--font-display` | `'Outfit', sans-serif` | Editorial headings & hero typography |
| `--font-sans` | `'Plus Jakarta Sans', sans-serif` | Standard body & interface copy |
| `--font-mono` | `'JetBrains Mono', monospace` | Telemetry logs, latency meters, code blocks |
