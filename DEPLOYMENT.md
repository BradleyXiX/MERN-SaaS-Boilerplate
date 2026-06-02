# Deployment Guide

Comprehensive guide for deploying MERN SaaS Boilerplate to production environments.

## Table of Contents

- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Backend Deployment](#backend-deployment)
- [Frontend Deployment](#frontend-deployment)
- [Database Setup](#database-setup)
- [Email Configuration](#email-configuration)
- [Security](#security)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

## Pre-Deployment Checklist

Before deploying to production, ensure:

- ✅ All tests passing locally (`npm test`)
- ✅ Code coverage above 80%
- ✅ No console errors or warnings
- ✅ Environment variables configured
- ✅ SSL certificate ready (HTTPS)
- ✅ Database backups configured
- ✅ Email service configured
- ✅ Security headers reviewed
- ✅ Rate limiting tuned for production
- ✅ Logging configured
- ✅ Error tracking (Sentry) setup
- ✅ Performance monitoring setup

## Backend Deployment

### Option 1: Heroku (Recommended for beginners)

```bash
# 1. Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# 2. Login to Heroku
heroku login

# 3. Create Heroku app
heroku create your-app-name

# 4. Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=<generate-strong-secret>
heroku config:set REFRESH_TOKEN_SECRET=<generate-strong-secret>
heroku config:set MONGO_URI=<mongodb-atlas-uri>
heroku config:set SMTP_HOST=smtp.sendgrid.net
heroku config:set SMTP_PORT=587
heroku config:set SMTP_USER=apikey
heroku config:set SMTP_PASS=<sendgrid-api-key>

# 5. Deploy
git push heroku main

# 6. Monitor logs
heroku logs --tail
```

### Option 2: AWS EC2 (Recommended for production)

```bash
# 1. Launch EC2 instance
# - Ubuntu 20.04 LTS
# - Security group: allow ports 22, 80, 443

# 2. SSH into instance
ssh -i your-key.pem ubuntu@your-instance-ip

# 3. Install dependencies
sudo apt update
sudo apt install -y nodejs npm mongodb
curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 4. Clone repository
git clone https://github.com/BradleyXiX/MERN-SaaS-Boilerplate.git
cd MERN-SaaS-Boilerplate

# 5. Install packages
npm run install:all

# 6. Setup environment
cp server/.env.example server/.env
# Edit server/.env with production values

# 7. Setup as systemd service
sudo nano /etc/systemd/system/mern-app.service
```

**systemd service file:**

```ini
[Unit]
Description=MERN SaaS Application
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/MERN-SaaS-Boilerplate/server
Environment="NODE_ENV=production"
Environment="PORT=3000"
ExecStart=/usr/bin/node app.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable mern-app
sudo systemctl start mern-app
sudo systemctl status mern-app
```

### Option 3: DigitalOcean App Platform

```bash
# 1. Connect GitHub repository
# https://cloud.digitalocean.com/apps

# 2. Create new app and select your repository

# 3. Configure build command
npm run install:all && npm --prefix server install

# 4. Configure run command
npm --prefix server start

# 5. Set environment variables in UI
# NODE_ENV=production
# JWT_SECRET=<strong-secret>
# MONGO_URI=<connection-string>
# ... (add all from .env.example)

# 6. Deploy
```

### Option 4: Docker & Container Registry

```bash
# 1. Create Dockerfile for backend
cat > server/Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

ENV NODE_ENV=production
PORT=3000

CMD ["node", "app.js"]
EOF

# 2. Create .dockerignore
cat > server/.dockerignore << 'EOF'
node_modules
npm-debug.log
.env
.git
coverage
EOF

# 3. Build image
docker build -t mern-backend:latest ./server

# 4. Push to registry (Docker Hub, ECR, etc.)
docker push your-registry/mern-backend:latest

# 5. Run container
docker run -e NODE_ENV=production \
  -e MONGO_URI=<uri> \
  -e JWT_SECRET=<secret> \
  -p 3000:3000 \
  your-registry/mern-backend:latest
```

## Frontend Deployment

### Option 1: Vercel (Recommended)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy from project root
vercel --prod

# 3. Configure environment variables in UI
# VITE_API_BASE_URL=https://your-backend.com

# 4. Vercel automatically handles:
# - Building (npm run build)
# - Caching
# - CDN distribution
# - SSL certificate
```

### Option 2: Netlify

```bash
# 1. Connect repository to Netlify
# https://app.netlify.com

# 2. Configure build settings
# Build command: npm --prefix client run build
# Publish directory: client/dist

# 3. Set environment variables
# VITE_API_BASE_URL=https://your-backend.com

# 4. Deploy with Git push
```

### Option 3: AWS S3 + CloudFront

```bash
# 1. Build production version
npm --prefix client run build

# 2. Create S3 bucket
aws s3 mb s3://your-app-bucket

# 3. Upload files
aws s3 sync client/dist/ s3://your-app-bucket --delete

# 4. Create CloudFront distribution
# Point to S3 bucket as origin

# 5. Configure CloudFront to handle SPA routing
# Error 404 -> Response: 200, /index.html

# 6. (Optional) Use custom domain with Route53
```

## Database Setup

### MongoDB Atlas (Cloud - Recommended)

```bash
# 1. Create MongoDB Atlas account
# https://www.mongodb.com/cloud/atlas

# 2. Create cluster
# - Provider: AWS, Google Cloud, or Azure
# - Region: Closest to your users
# - Tier: M2 (free) or higher

# 3. Create database user
# - Username: app_user
# - Password: (generate strong password)
# - Permissions: Read and write

# 4. Add IP whitelist
# - Click "Add IP Address"
# - Select "Add Entry"
# - Enter your application's IP or 0.0.0.0/0 for all

# 5. Get connection string
# Copy: mongodb+srv://user:pass@cluster.mongodb.net/dbname?retryWrites=true&w=majority

# 6. Set in environment
export MONGO_URI=<connection-string>
```

### Self-Hosted MongoDB

```bash
# 1. Install MongoDB Enterprise on production server
# https://docs.mongodb.com/manual/installation/

# 2. Enable authentication
sudo nano /etc/mongod.conf
# Add:
# security:
#   authorization: enabled

# 3. Create admin user
mongosh admin
db.createUser({
  user: "admin",
  pwd: "strong-password",
  roles: ["root"]
})

# 4. Create application database
db.createUser({
  user: "app_user",
  pwd: "app-password",
  db: "saas_db",
  roles: ["readWrite", "dbOwner"]
})

# 5. Restart MongoDB
sudo systemctl restart mongod

# 6. Test connection
mongosh "mongodb://app_user:app-password@localhost/saas_db"
```

### Backups

```bash
# Automated daily backups with MongoDB Atlas
# Enable in Cluster settings > Backup

# Manual backup
mongodump --uri="mongodb://user:pass@host/dbname" --out=./backup

# Restore backup
mongorestore --uri="mongodb://user:pass@host/dbname" ./backup/dbname
```

## Email Configuration

### SendGrid (Recommended for production)

```bash
# 1. Create SendGrid account
# https://sendgrid.com

# 2. Create API key
# Settings > API Keys > Create API Key

# 3. Configure environment variables
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=<your-sendgrid-api-key>
SMTP_SECURE=false

# 4. Test email
npm --prefix server test-email.js
```

### Gmail

```bash
# 1. Enable 2-Factor Authentication on Gmail account
# https://myaccount.google.com/security

# 2. Generate App Password
# https://myaccount.google.com/apppasswords
# Select: Mail and Windows Computer

# 3. Configure environment variables
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=<16-character-app-password>
SMTP_SECURE=false
```

## Security

### HTTPS/SSL Certificate

```bash
# Using Let's Encrypt with Certbot (Free)

# 1. Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# 2. Generate certificate
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# 3. Configure Nginx to use certificate
# (See Nginx configuration below)

# 4. Auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### Environment Security

```bash
# 1. Never commit .env files
echo ".env" >> .gitignore

# 2. Use strong secrets (generate with crypto)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 3. Restrict .env file permissions
chmod 600 .env

# 4. Use environment-specific configurations
# .env.development (tracked)
# .env.production (not tracked, has instructions)
```

### Security Headers

Already configured with Helmet.js. Verify in browser:

```bash
# Check headers
curl -I https://yourdomain.com

# Should include:
# - Strict-Transport-Security
# - X-Content-Type-Options
# - X-Frame-Options
# - Content-Security-Policy
```

## Monitoring

### Error Tracking (Sentry)

```bash
# 1. Create Sentry account
# https://sentry.io

# 2. Create project (Node.js for backend, React for frontend)

# 3. Install SDK

# Backend
npm --prefix server install @sentry/node

# Frontend
npm --prefix client install @sentry/react

# 4. Initialize in application

# server/app.js
const Sentry = require('@sentry/node');
Sentry.init({ dsn: process.env.SENTRY_DSN });

# client/App.jsx
import * as Sentry from "@sentry/react";
Sentry.init({ dsn: process.env.VITE_SENTRY_DSN });
```

### Performance Monitoring

```bash
# Google PageSpeed Insights
https://pagespeed.web.dev

# GTmetrix
https://gtmetrix.com

# Lighthouse (built into Chrome DevTools)
# Right-click > Inspect > Lighthouse
```

### Logging

```bash
# View application logs (Heroku)
heroku logs --tail

# View server logs (EC2/VPS)
sudo journalctl -u mern-app -f

# View MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log
```

## Troubleshooting

### Application Won't Start

```bash
# Check logs
npm --prefix server start 2>&1 | head -20

# Verify environment variables
node -e "console.log(process.env.MONGO_URI)"

# Test database connection
npm --prefix server test-connection.js

# Check Node version
node --version  # Should be 16+
```

### High CPU/Memory Usage

```bash
# Check process usage
top -p $(pgrep -f "node app.js")

# Identify memory leaks
# Use Node.js profiler or clinic.js

# Restart service if hanging
sudo systemctl restart mern-app
```

### Email Not Sending

```bash
# Check SMTP configuration
npm --prefix server test-email.js

# Verify credentials in .env
printenv | grep SMTP

# Check email service logs
# SendGrid: https://app.sendgrid.com/email_activity
# Gmail: Gmail account security page
```

### Database Connection Issues

```bash
# Test MongoDB connection
mongosh "mongodb+srv://user:pass@host/dbname"

# Check MongoDB Atlas IP whitelist
# https://cloud.mongodb.com/v2

# Verify connection string format
# mongodb+srv://user:pass@host/dbname?retryWrites=true&w=majority
```

## Production Checklist

- [ ] SSL/HTTPS certificate installed
- [ ] Environment variables securely set
- [ ] Database backups configured and tested
- [ ] Email service configured and tested
- [ ] Error tracking (Sentry) configured
- [ ] Logging configured and monitored
- [ ] Rate limiting configured for production loads
- [ ] CORS configured with allowed domains
- [ ] Security headers verified
- [ ] Database indexes optimized
- [ ] Application load tested
- [ ] Rollback plan documented
- [ ] On-call monitoring setup
- [ ] Documentation updated for team

## Useful Commands

```bash
# Deploy new version (after testing)
git push origin main
# (Automatic deployment for Vercel/Netlify)

# Manual restart
sudo systemctl restart mern-app

# Check service status
sudo systemctl status mern-app

# View recent logs
journalctl -u mern-app -n 100

# Increase log verbosity
DEBUG=* npm start
```

## Support Resources

- [Node.js Deployment](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [Express Production Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [MongoDB Deployment](https://docs.mongodb.com/manual/administration/)
- [React Production Build](https://reactjs.org/docs/optimizing-performance.html)

---

**Last Updated:** June 2026  
**Version:** 1.0.0

Need help? Check existing documentation or create a GitHub issue!
