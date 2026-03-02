const express = require('express');
require('dotenv').config({ path: '.env.local' });

const { helmet, limiter, cors } = require('./middleware/security');
const errorHandler = require('./middleware/errorHandler');
const checkRoutes = require('./routes/checkRoutes');
const pharmacyRoutes = require('./routes/pharmacyRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet);
app.use(cors);
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  console.log('✅ Health check requested');
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Request logger
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path}`);
  next();
});

// API routes
app.use('/api', checkRoutes);
app.use('/api', pharmacyRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Error handler (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
