# SaaS Pro — Production Deployment Guide

Authoritative guide for deploying SaaS Pro to production cloud platforms (Vercel, Render, AWS ECS, Docker) with end-to-end security hardening, HTTPS cookie routing, and health verification.

---

## Pre-Deployment Verification Checklist

Before triggering a production deployment, ensure every check passes:

- [ ] All client tests pass: `npm test --prefix client -- --run` (15 passing).
- [ ] All server tests pass: `npm test --prefix server -- --runInBand` (8 passing).
- [ ] Client bundle builds cleanly: `npm run build --prefix client`.
- [ ] `NODE_ENV=production` is asserted in the backend runtime.
- [ ] Cryptographic keys (`JWT_SECRET`, `REFRESH_TOKEN_SECRET`) are at least 32 characters long.
- [ ] `CORS_ALLOWED_ORIGINS` explicitly matches the production client origin (no wildcards `*`).
- [ ] MongoDB connection uses TLS (`mongodb+srv://...`).

---

## Deployment Pattern 1: Cloud PaaS (Vercel Frontend + Render Backend)

### Step 1: Deploy Frontend on Vercel

1. Link the repository to Vercel.
2. Set Root Directory to repository root or `client`.
   - If deploying from the repository root, [`vercel.json`](file:///c:/Users/Admin/OneDrive/Desktop/Source%20Code/MERN%20SaaS%20Boiler-Plate/vercel.json) specifies:
     ```json
     {
       "buildCommand": "npm run build --prefix client",
       "outputDirectory": "client/dist",
       "cleanUrls": true,
       "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
     }
     ```
3. Set environment variable:
   ```env
   VITE_API_BASE_URL=https://api.yourdomain.com
   ```
4. Trigger production deployment.

### Step 2: Deploy Backend Gateway (Render / Railway / Fly.io)

1. Create a new Web Service pointing to `server/`.
2. Build Command: `npm install --production`.
3. Start Command: `node app.js`.
4. Configure production environment variables in the PaaS dashboard:
   ```env
   NODE_ENV=production
   PORT=5000
   MONGO_URI=mongodb+srv://dbuser:password@cluster.mongodb.net/production?retryWrites=true&w=majority
   JWT_SECRET=super_strong_cryptographic_production_secret_key_32chars
   REFRESH_TOKEN_SECRET=super_strong_refresh_production_secret_key_32chars
   CORS_ALLOWED_ORIGINS=https://app.yourdomain.com
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASS=SG.production_sendgrid_key
   ```
5. Note: In production with `NODE_ENV=production`, `cookieHelper.js` automatically enables `secure: true`. Both frontend and backend must be accessed over **HTTPS**.

---

## Deployment Pattern 2: Containerized Deployment (Docker & Nginx)

### Production Dockerfile (`server/Dockerfile`)

```dockerfile
# Multi-stage production container for Express backend
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 5000
USER node
CMD ["node", "app.js"]
```

### Production Nginx Reverse Proxy Configuration

When hosting on a dedicated VPS or AWS EC2, terminate TLS at Nginx and proxy requests to Express:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Ensure HttpOnly cookies pass cleanly through the proxy
        proxy_pass_header Set-Cookie;
        proxy_cookie_domain ~.*$ api.yourdomain.com;
    }
}
```

---

## Step 3: Production Health Verification

Verify deployment uptime:

```bash
curl -I https://api.yourdomain.com/api/health
```

**Expected Response:**
```http
HTTP/2 200 
content-type: application/json; charset=utf-8
strict-transport-security: max-age=15552000; includeSubDomains
x-content-type-options: nosniff
x-frame-options: DENY
```
