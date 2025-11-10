import React, { useState, useEffect } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const Analytics = () => {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const [salesData, setSalesData] = useState([]);
    const [productStats, setProductStats] = useState([]);
    const [userStats, setUserStats] = useState([]);
    const [totalStats, setTotalStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalUsers: 0
    });
    const [granularity, setGranularity] = useState('month');
    const [loading, setLoading] = useState(false);

    // Fetch real analytics data from backend
    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                setLoading(true);
                // Rely on axios defaults set by AuthContext (Authorization: Bearer <idToken>)
                const { data } = await axios.get(`/admin/analytics?granularity=${granularity}`);
                if (data?.success) {
                    setSalesData(Array.isArray(data.salesData) ? data.salesData : []);
                    setProductStats(Array.isArray(data.productStats) ? data.productStats : []);
                    setUserStats(Array.isArray(data.userStats) ? data.userStats : []);
                    setTotalStats({
                        totalRevenue: Number(data.totals?.totalRevenue || 0),
                        totalOrders: Number(data.totals?.totalOrders || 0),
                        totalProducts: Number(data.totals?.totalProducts || 0),
                        totalUsers: Number(data.totals?.totalUsers || 0)
                    });
                }
            } catch (err) {
                // Fallback to empty data if API fails
                setSalesData([]);
                setProductStats([]);
                setUserStats([]);
                setTotalStats({ totalRevenue: 0, totalOrders: 0, totalProducts: 0, totalUsers: 0 });
            } finally {
                setLoading(false);
            }
        };

        // Only fetch when authenticated and auth context has finished loading
        if (isAuthenticated && !authLoading) {
            fetchAnalytics();
        }
    }, [granularity, isAuthenticated, authLoading]);

    const formatCurrency = (value) => `₱${value.toLocaleString()}`;

    const palette = {
        blue: '#3b82f6',
        green: '#10b981',
        purple: '#8b5cf6',
        lime: '#22c55e',
        grid: '#f1f5f9',
        axis: '#64748b',
        label: '#1e293b'
    };

    const CustomTooltip = ({ active, payload, label, currencyKeys = [] }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 12,
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    padding: 12,
                    fontSize: 14
                }}>
                    <div style={{ color: palette.label, fontWeight: 600, marginBottom: 6 }}>{label}</div>
                    {payload.map((p, idx) => {
                        const key = p.dataKey || p.name;
                        const val = currencyKeys.includes(key) || /revenue/i.test(key)
                            ? formatCurrency(p.value)
                            : Number(p.value).toLocaleString();
                        return (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, color: palette.axis }}>
                                <span style={{ width: 10, height: 10, background: p.color, borderRadius: 2 }} />
                                <span style={{ minWidth: 80 }}>{p.name}</span>
                                <strong style={{ color: palette.label }}>{val}</strong>
                            </div>
                        );
                    })}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="analytics-container">
            <div className="page-header">
                <h2 className="page-title">Analytics Dashboard</h2>
                <p className="page-subtitle">Monitor your business performance and key metrics</p>
            </div>
            
            {/* Key Metrics Cards */}
            <div className="metrics-grid">
                <div className="card metric-card revenue-card">
                    <div className="metric-icon revenue-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.82v-1.91c-1.07-.27-2.24-.4-2.24-2.14 0-1.93 1.94-2.39 3.41-2.58v-4.7c-.77.15-1.17.64-1.17 1.17H8.77c0-1.99 1.99-2.7 3.23-2.7v-1.91h2.82v1.91c1.07.27 2.24.4 2.24 2.14 0 1.93-1.94 2.39-3.41 2.58v4.7c.77-.15 1.17-.64 1.17-1.17h1.82c0 1.99-1.99 2.7-3.23 2.7z"/>
                        </svg>
                    </div>
                    <div className="metric-content">
                        <h3 className="metric-label">Total Revenue</h3>
                        <p className="metric-value">{formatCurrency(totalStats.totalRevenue)}</p>
                        <span className="status-badge status-success">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{marginRight: '4px'}}>
                                <path d="M7 14l5-5 5 5z"/>
                            </svg>
                            +12.5%
                        </span>
                    </div>
                </div>
                
                <div className="card metric-card orders-card">
                    <div className="metric-icon orders-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM10 6a2 2 0 0 1 4 0v1h-4V6zm8 13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h4v1a1 1 0 0 0 2 0V9h2v10z"/>
                        </svg>
                    </div>
                    <div className="metric-content">
                        <h3 className="metric-label">Total Orders</h3>
                        <p className="metric-value">{totalStats.totalOrders}</p>
                        <span className="status-badge status-success">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{marginRight: '4px'}}>
                                <path d="M7 14l5-5 5 5z"/>
                            </svg>
                            +8.3%
                        </span>
                    </div>
                </div>
                
                <div className="card metric-card products-card">
                    <div className="metric-icon products-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20 7h-4V6a4 4 0 0 0-8 0v1H4a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM10 6a2 2 0 0 1 4 0v1h-4V6zm8 13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h6v1a1 1 0 0 0 2 0V9h2v10z"/>
                        </svg>
                    </div>
                    <div className="metric-content">
                        <h3 className="metric-label">Total Products</h3>
                        <p className="metric-value">{totalStats.totalProducts}</p>
                        <span className="status-badge status-neutral">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{marginRight: '4px'}}>
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                            0%
                        </span>
                    </div>
                </div>
                
                <div className="card metric-card users-card">
                    <div className="metric-icon users-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                    </div>
                    <div className="metric-content">
                        <h3 className="metric-label">Total Users</h3>
                        <p className="metric-value">{totalStats.totalUsers}</p>
                        <span className="status-badge status-success">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{marginRight: '4px'}}>
                                <path d="M7 14l5-5 5 5z"/>
                            </svg>
                            +15.7%
                        </span>
                    </div>
                </div>
            </div>

            {/* Charts Section (full-width stacked) */}
            <div className="charts-stack">
                {/* Sales Trend Chart */}
                <div className="card chart-container" style={{ width: '100%', marginBottom: '16px' }}>
                    <div className="card-header">
                        <div>
                            <h3 className="chart-title">Sales Trend</h3>
                            <p className="chart-subtitle">Revenue and orders by period</p>
                        </div>
                        <div className="chart-actions">
                            <select
                                className="select select-sm"
                                value={granularity}
                                onChange={(e) => setGranularity(e.target.value)}
                                aria-label="Select sales granularity"
                            >
                                <option value="week">Week</option>
                                <option value="month">Month</option>
                                <option value="year">Year</option>
                            </select>
                        </div>
                    </div>
                    <div className="card-body">
                        <div className="chart-wrapper">
                            <ResponsiveContainer width="100%" height={320}>
                                <LineChart data={salesData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} />
                                    <XAxis 
                                        dataKey="month" 
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: palette.axis, fontSize: 12 }}
                                    />
                                    <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: palette.axis, fontSize: 12 }} tickFormatter={(v) => formatCurrency(v)} />
                                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: palette.axis, fontSize: 12 }} />
                                    <Tooltip content={<CustomTooltip currencyKeys={["revenue"]} />} />
                                    <Legend />
                                    <Line 
                                        type="monotone" 
                                        dataKey="revenue" 
                                        yAxisId="left"
                                        stroke={palette.blue} 
                                        strokeWidth={3}
                                        name="Revenue"
                                        dot={{ fill: palette.blue, strokeWidth: 2, r: 5 }}
                                        activeDot={{ r: 7, stroke: palette.blue, strokeWidth: 3, fill: 'white' }}
                                        animationDuration={600}
                                        animationEasing="ease-out"
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="orders" 
                                        yAxisId="right"
                                        stroke={palette.green} 
                                        strokeWidth={3}
                                        name="Orders"
                                        dot={{ fill: palette.green, strokeWidth: 2, r: 5 }}
                                        activeDot={{ r: 7, stroke: palette.green, strokeWidth: 3, fill: 'white' }}
                                        animationDuration={600}
                                        animationEasing="ease-out"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Product Performance Chart (Units Sold) */}
                <div className="card chart-container" style={{ width: '100%', marginBottom: '16px' }}>
                    <div className="card-header">
                        <div>
                            <h3 className="chart-title">Product Performance</h3>
                            <p className="chart-subtitle">Top selling products by units sold</p>
                        </div>
                        <div className="chart-actions">
                            <button className="btn btn-sm btn-secondary">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div className="card-body">
                        <div className="chart-wrapper">
                            {productStats.length > 0 ? (
                            <ResponsiveContainer width="100%" height={320}>
                                <BarChart data={productStats} margin={{ top: 20, right: 30, left: 20, bottom: 20 }} barCategoryGap={24}>
                                    <defs>
                                        <linearGradient id="barSalesGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={palette.purple} stopOpacity={1}/>
                                            <stop offset="100%" stopColor={palette.purple} stopOpacity={0.7}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} />
                                    <XAxis 
                                        dataKey="name" 
                                        angle={-45} 
                                        textAnchor="end" 
                                        height={80}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: palette.axis, fontSize: 11 }}
                                    />
                                    <YAxis 
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: palette.axis, fontSize: 12 }}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Bar 
                                        dataKey="sales" 
                                        fill="url(#barSalesGradient)" 
                                        name="Sales"
                                        radius={[6, 6, 0, 0]}
                                        maxBarSize={48}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                            ) : (
                                <div style={{ padding: '16px', color: palette.muted, textAlign: 'center' }}>
                                    No product sales for selected range.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Product Revenue Chart */}
                <div className="card chart-container" style={{ width: '100%', marginBottom: '16px' }}>
                    <div className="card-header">
                        <div>
                            <h3 className="chart-title">Product Revenue</h3>
                            <p className="chart-subtitle">Top products by total revenue</p>
                        </div>
                        <div className="chart-actions">
                            <button className="btn btn-sm btn-secondary">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div className="card-body">
                        <div className="chart-wrapper">
                            {productStats.length > 0 ? (
                            <ResponsiveContainer width="100%" height={320}>
                                <BarChart data={productStats} margin={{ top: 20, right: 30, left: 20, bottom: 20 }} barCategoryGap={24}>
                                    <defs>
                                        <linearGradient id="barRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={palette.lime} stopOpacity={1}/>
                                            <stop offset="100%" stopColor={palette.lime} stopOpacity={0.7}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} />
                                    <XAxis 
                                        dataKey="name" 
                                        angle={-45} 
                                        textAnchor="end" 
                                        height={80}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: palette.axis, fontSize: 11 }}
                                    />
                                    <YAxis 
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: palette.axis, fontSize: 12 }}
                                        tickFormatter={(v) => `₱${Number(v).toLocaleString()}`}
                                    />
                                    <Tooltip content={<CustomTooltip currencyKeys={["revenue"]} />} />
                                    <Legend />
                                    <Bar 
                                        dataKey="revenue" 
                                        fill="url(#barRevenueGradient)" 
                                        name="Revenue"
                                        radius={[6, 6, 0, 0]}
                                        maxBarSize={48}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                            ) : (
                                <div style={{ padding: '16px', color: palette.muted, textAlign: 'center' }}>
                                    No product revenue for selected range.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* User Distribution Chart */}
                <div className="card chart-container" style={{ width: '100%', marginBottom: '16px' }}>
                    <div className="card-header">
                        <div>
                            <h3 className="chart-title">User Distribution</h3>
                            <p className="chart-subtitle">Breakdown of user types</p>
                        </div>
                        <div className="chart-actions">
                            <button className="btn btn-sm btn-secondary">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div className="card-body">
                        <div className="chart-wrapper">
                            {userStats.length > 0 ? (
                            <ResponsiveContainer width="100%" height={320}>
                                <PieChart>
                                    <Pie
                                        data={userStats}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        innerRadius={55}
                                        outerRadius={95}
                                        fill="#8884d8"
                                        dataKey="value"
                                        stroke="#ffffff"
                                        strokeWidth={2}
                                    >
                                        {userStats.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            ) : (
                                <div style={{ padding: '16px', color: palette.muted, textAlign: 'center' }}>
                                    No user distribution data for selected range.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;