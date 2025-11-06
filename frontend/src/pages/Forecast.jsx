import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MetaData from '../Components/Layout/MetaData';
import { useAuth } from '../contexts/AuthContext';

const formatKg = (v) => `${Number(v || 0).toLocaleString()} kg`;

const Forecast = () => {
  const { token } = useAuth();
  const [pondId, setPondId] = useState('pond-1');
  const [latest, setLatest] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [status, setStatus] = useState('');

  const fetchLatest = async () => {
    try {
      setStatus('');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const { data } = await axios.get(`${import.meta.env.VITE_API}/ponds/${pondId}/sensors/latest`, config);
      if (data.success) {
        setLatest(data.reading);
        setForecast(data.forecast);
      } else {
        setLatest(null);
        setForecast(null);
        setStatus(data.message || 'Failed to load');
      }
    } catch (err) {
      setStatus(err.message);
    }
  };

  useEffect(() => { fetchLatest(); }, [pondId]);

  const daysRemaining = forecast?.daysToHarvest || 0;
  const expectedDate = forecast?.expectedHarvestDate ? new Date(forecast.expectedHarvestDate) : null;

  // Derived display strings
  const expectedWeightStr = forecast ? formatKg(forecast.expectedWeightKg) : '—';
  const survivorsStr = forecast ? `${forecast.survivors}` : '—';
  const dateStr = expectedDate ? expectedDate.toLocaleDateString() : 'Awaiting sensor data';

  return (
    <div className="container py-4">
      <MetaData title="Forecast" />
      <h2 className="mb-3">Harvest Forecast</h2>
      <p className="text-muted">Forecast is computed from latest sensor/manual reading. Harvest date is not editable.</p>

      <div className="mb-3">
        <label className="form-label">Pond ID</label>
        <input className="form-control" value={pondId} onChange={(e) => setPondId(e.target.value)} />
      </div>

      <div className="row g-4">
        <div className="col-md-6">
          <div className="card p-3">
            <h5 className="mb-2">Forecast Preview</h5>
            <div className="d-flex justify-content-between"><span>Days to Harvest</span><span>{daysRemaining} days</span></div>
            <div className="d-flex justify-content-between"><span>Expected Weight</span><span>{expectedWeightStr}</span></div>
            <div className="d-flex justify-content-between"><span>Survivors</span><span>{survivorsStr}</span></div>
            <div className="d-flex justify-content-between"><span>Confidence</span><span>{latest ? '100%' : '0%'}</span></div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card p-3">
            <h5 className="mb-2">Inputs (latest)</h5>
            <div className="row g-3">
              {[
                { key: 'stockCount', label: 'Stock Count' },
                { key: 'currentWeight', label: 'Current Weight (g/fish)' },
                { key: 'growthRatePerWeek', label: 'Growth Rate (g/week)' },
                { key: 'targetWeight', label: 'Target Weight (g/fish)' },
                { key: 'survivalRate', label: 'Survival Rate (%)' },
                { key: 'temperature', label: 'Temperature (°C)' },
                { key: 'pH', label: 'pH Level' },
                { key: 'oxygen', label: 'Oxygen (mg/L)' },
              ].map((i) => (
                <div className="col-6" key={i.key}>
                  <label className="form-label">{i.label}</label>
                  {/* Read-only — reflects Monitoring page entries */}
                  <input className="form-control" value={latest?.[i.key] ?? ''} readOnly />
                </div>
              ))}

              {/* Harvest date is locked (computed only) */}
              <div className="col-12">
                <label className="form-label">Estimated Harvest Date</label>
                <input className="form-control" value={dateStr} readOnly />
                <small className="text-muted">This date is computed from the latest inputs; editing is disabled.</small>
              </div>
            </div>
            <div className="mt-3">
              <button className="btn btn-outline-secondary" onClick={fetchLatest}>Refresh</button>
              {status && <span className="ms-3 text-muted">{status}</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forecast;