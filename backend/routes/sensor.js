const express = require('express');
const router = express.Router();

const { createReading, latestReading, forecastFromLatest } = require('../controllers/sensorController');
const { isAuthenticatedUser } = require('../middlewares/auth');

// Create a sensor/manual reading for a pond
router.route('/ponds/:pondId/sensors').post(isAuthenticatedUser, createReading);

// Get latest reading for a pond
router.route('/ponds/:pondId/sensors/latest').get(isAuthenticatedUser, latestReading);

// Get computed forecast (expected weight & date) from latest reading
router.route('/ponds/:pondId/forecast').get(isAuthenticatedUser, forecastFromLatest);

module.exports = router;