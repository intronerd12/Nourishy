const SensorReading = require('../models/sensorReading');

// Helper to compute forecast from a reading
const computeForecast = (r) => {
  const now = new Date();
  const current = Number(r.currentWeight || 0); // g
  const target = Number(r.targetWeight || 0); // g
  const growthWeekly = Number(r.growthRatePerWeek || 0); // g/week
  const stock = Number(r.stockCount || 0);
  const survivalPct = Number(r.survivalRate || 0);

  // Survivors
  const survivors = Math.round(stock * (survivalPct / 100));

  // Weeks/days to harvest
  let weeksToHarvest = 0;
  if (target > current && growthWeekly > 0) {
    weeksToHarvest = Math.ceil((target - current) / growthWeekly);
  }
  const daysToHarvest = weeksToHarvest * 7;
  const expectedHarvestDate = new Date(now.getTime() + daysToHarvest * 24 * 60 * 60 * 1000);

  // Expected total harvest biomass (kg). Link strictly to stock count.
  // If target not set, fallback to current
  const perFishHarvestWeight = target > 0 ? target : current;
  const expectedWeightKg = Number(((survivors * perFishHarvestWeight) / 1000).toFixed(2));

  return {
    daysToHarvest,
    expectedHarvestDate,
    expectedWeightKg,
    survivors,
  };
};

// POST /api/v1/ponds/:pondId/sensors
exports.createReading = async (req, res) => {
  try {
    const { pondId } = req.params;
    const payload = { ...req.body, pondId };
    const created = await SensorReading.create(payload);
    const forecast = computeForecast(created);
    return res.status(201).json({ success: true, reading: created, forecast });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

// GET /api/v1/ponds/:pondId/sensors/latest
exports.latestReading = async (req, res) => {
  try {
    const { pondId } = req.params;
    const latest = await SensorReading.findOne({ pondId }).sort({ createdAt: -1 });
    if (!latest) {
      return res.status(200).json({ success: true, reading: null, forecast: null, message: 'No sensor data yet' });
    }
    const forecast = computeForecast(latest);
    return res.status(200).json({ success: true, reading: latest, forecast });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/v1/ponds/:pondId/forecast
exports.forecastFromLatest = async (req, res) => {
  try {
    const { pondId } = req.params;
    const latest = await SensorReading.findOne({ pondId }).sort({ createdAt: -1 });
    if (!latest) {
      return res.status(200).json({ success: true, forecast: null, message: 'No sensor data yet' });
    }
    const forecast = computeForecast(latest);
    return res.status(200).json({ success: true, forecast });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};