const express = require('express');
const app = express();
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

// Import routes
const products = require('./routes/product');
const auth = require('./routes/auth');
const orders = require('./routes/order');
const analytics = require('./routes/analytics');
const sensor = require('./routes/sensor');

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS: allow configurable origins, permissive in development
const allowedOriginsEnv = process.env.ALLOWED_ORIGINS || '';
const allowedOrigins = allowedOriginsEnv
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests or same-origin
    if (!origin) return callback(null, true);

    const isDev = process.env.NODE_ENV !== 'PRODUCTION';
    const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

    if (isDev && (isLocalhost || allowedOrigins.length === 0)) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true,
}));
app.use(morgan('dev'));

// Mount routes
app.use('/api/v1', products);
app.use('/api/v1', auth);
app.use('/api/v1', orders);
app.use('/api/v1', analytics);
app.use('/api/v1', sensor);

// Basic route
app.get('/', (req, res) => {
    res.send('API is running');
});

module.exports = app;