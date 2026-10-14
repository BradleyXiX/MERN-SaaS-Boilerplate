const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const { errorHandler } = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();

// Trust reverse proxy hops (required for secure cookies and rate limiting on Render, Railway, Vercel)
app.set('trust proxy', 1);

// 1. Strict Content Security Policy & Security Headers via Helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'http://localhost:5173', 'http://127.0.0.1:5173'],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// 2. Logging
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(
  morgan(morganFormat, {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);

// 3. Whitelisted CORS with Cookie Credentials
const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((origin) => origin.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl) in development
      if (!origin && process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      if (origin && allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error(`Origin [${origin}] blocked by CORS policy`));
    },
    credentials: true, // Required for HttpOnly cookie transmission
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    maxAge: 86400,
  })
);

// 4. Parsers: Body & Cookie
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// 5. API Routes
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    dbConnected: mongoose.connection.readyState === 1,
  });
});

// 6. RFC 7807 404 Route Not Found
app.use((req, res) => {
  res.status(404).contentType('application/problem+json').json({
    type: 'https://api.example.com/errors/not-found',
    title: 'Not Found',
    status: 404,
    detail: `Cannot ${req.method} ${req.originalUrl}`,
    instance: req.originalUrl,
    timestamp: new Date().toISOString(),
  });
});

// 7. Global RFC 7807 Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  // Bind to 0.0.0.0 for cloud platform container routing (Render, Railway, ECS)
  const server = app.listen(PORT, '0.0.0.0', () => {
    logger.info(`Server successfully running on port ${PORT}`);
    console.log(`🚀 API Server running on port ${PORT}`);
  });

  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/saas';

  if (mongoUri.includes('localhost') || mongoUri.includes('127.0.0.1')) {
    if (process.env.NODE_ENV === 'production') {
      logger.warn(
        'MONGO_URI points to localhost in a production environment. Set MONGO_URI in your host dashboard to your MongoDB Atlas cluster URI.'
      );
      console.warn(
        '⚠️  WARNING: MONGO_URI is set to localhost in production! Please set MONGO_URI in your Render environment variables to your MongoDB Atlas connection string.'
      );
    }
  }

  mongoose
    .connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    })
    .then(() => {
      logger.info('MongoDB connected successfully');
      console.log('✅ MongoDB connected successfully');
    })
    .catch((err) => {
      logger.error(`MongoDB connection error: ${err.message}`, err);
      console.error(`❌ MongoDB connection failed: ${err.message}`);
      console.error(
        '👉 Verify that MONGO_URI is set in Render Environment variables, credentials are valid, and Atlas Network Access allows 0.0.0.0/0.'
      );
    });

  const shutdown = () => {
    logger.info('Shutting down server gracefully...');
    server.close(() => {
      mongoose.connection.close(false).then(() => {
        logger.info('Server and database connections closed');
        process.exit(0);
      });
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

module.exports = app;
