import React, { useState } from 'react';
import axios from 'axios';
import MetaData from '../Components/Layout/MetaData';
import { useAuth } from '../contexts/AuthContext';

const Monitoring = () => {
  const { token } = useAuth();
  const [pondId, setPondId] = useState('pond-1');
  const [form, setForm] = useState({
    temperature: '',
    pH: '',
    oxygen: '',
    stockCount: '',
    currentWeight: '',
    growthRatePerWeek: '',
    targetWeight: '',
    survivalRate: '',
    source: 'manual',
  });
  const [status, setStatus] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setStatus('');
    try {
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};
      const { data } = await axios.post(
        `${import.meta.env.VITE_API}/ponds/${pondId}/sensors`,
        {
          ...Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v === '' ? undefined : Number(v) || v])),
        },
        config
      );
      if (data.success) {
        setStatus('Saved. Forecast updated.');
      } else {
        setStatus(data.message || 'Failed to save');
      }
    } catch (err) {
      setStatus(err.message);
    }
  };

  return (
    <div className="container py-4">
      <MetaData title="Monitoring" />
      <h2 className="mb-3">Monitoring</h2>
      <p className="text-muted">Submit sensor/manual readings. The forecast page will reflect latest values.</p>

      <div className="mb-3">
        <label className="form-label">Pond ID</label>
        <input className="form-control" value={pondId} onChange={(e) => setPondId(e.target.value)} />
      </div>

      <form onSubmit={submit} className="row g-3">
        {[
          { name: 'temperature', label: 'Temperature (°C)' },
          { name: 'pH', label: 'pH Level' },
          { name: 'oxygen', label: 'Oxygen (mg/L)' },
          { name: 'stockCount', label: 'Stock Count (fish)' },
          { name: 'currentWeight', label: 'Current Weight (g/fish)' },
          { name: 'growthRatePerWeek', label: 'Growth Rate (g/week)' },
          { name: 'targetWeight', label: 'Target Weight (g/fish)' },
          { name: 'survivalRate', label: 'Survival Rate (%)' },
        ].map((f) => (
          <div key={f.name} className="col-md-3">
            <label className="form-label">{f.label}</label>
            <input
              type="number"
              className="form-control"
              name={f.name}
              value={form[f.name]}
              onChange={handleChange}
              step="any"
            />
          </div>
        ))}
        <div className="col-12">
          <button className="btn btn-primary" type="submit">Save Reading</button>
          {status && <span className="ms-3 text-muted">{status}</span>}
        </div>
      </form>
    </div>
  );
};

export default Monitoring;