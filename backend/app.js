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
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true
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