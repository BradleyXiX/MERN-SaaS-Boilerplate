const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const morgan = require('morgan');
const authRoutes = require('./routes/auth');
const { errorHandler } = require('./middleware/errorHandler');
const logger = require('./utils/logger');
require('dotenv').config();
const cors = require('cors');

const app = express();

// Security headers
app.use(helmet());

// Logging
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat, {
  stream: { write: (message) => logger.info(message.trim()) }
}));

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

// 404 Handler - Must come after all routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: 'Route not found',
  });
});

// Global Error Handler - Must be last
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/saas')
  .then(() => {
    app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
  })
  .catch((err) => logger.error('DB connection error', err));
