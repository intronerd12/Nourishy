const mongoose = require('mongoose');

const SensorReadingSchema = new mongoose.Schema(
  {
    pondId: { type: String, required: true, index: true },
    // Telemetry
    temperature: { type: Number }, // °C
    pH: { type: Number },
    oxygen: { type: Number }, // mg/L
    // Stock/biomass inputs
    stockCount: { type: Number },
    currentWeight: { type: Number }, // grams per fish
    growthRatePerWeek: { type: Number }, // grams per fish per week
    targetWeight: { type: Number }, // grams per fish
    survivalRate: { type: Number }, // percentage 0-100
    // Meta
    source: { type: String, enum: ['sensor', 'manual'], default: 'manual' },
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SensorReading', SensorReadingSchema);