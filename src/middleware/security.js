const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS || '*';
const corsOptions = {
  origin: allowedOrigins === '*' ? true : allowedOrigins.split(',').map(origin => origin.trim()),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

module.exports = {
  helmet: helmet(),
  limiter,
  cors: cors(corsOptions),
};
