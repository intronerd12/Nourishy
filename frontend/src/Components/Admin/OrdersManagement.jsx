import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/AdminOrders.css';

const statusOptions = ['Pending', 'Confirmed', 'Cancelled', 'Delivered'];

const statusClass = (status) => {
  switch (status) {
    case 'Pending':
      return 'pending';
    case 'Confirmed':
      return 'confirmed';
    case 'Cancelled':
      return 'cancelled';
    case 'Delivered':
      return 'delivered';
    default:
      return 'neutral';
  }
};

const OrdersManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState({}); // map of orderId => boolean
  const { isAuthenticated, loading: authLoading } = useAuth();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await axios.get(`/admin/orders`);
      if (data.success) {
        setOrders(data.orders || []);
      } else {
        setError('Failed to fetch orders');
        toast.error('Failed to fetch orders');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch orders');
      toast.error(err.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchOrders();
    }
  }, [isAuthenticated, authLoading]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdating(prev => ({ ...prev, [orderId]: true }));
      const config = { headers: { 'Content-Type': 'application/json' } };
      const { data } = await axios.put(
        `/admin/order/${orderId}`,
        { status: newStatus },
        config
      );

      if (data.success) {
        setOrders(prev => prev.map(o => (o._id === orderId ? { ...o, orderStatus: newStatus } : o)));
        toast.success(`Order ${orderId.slice(-6)} updated to ${newStatus}`);
      } else {
        toast.error('Failed to update order');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order');
    } finally {
      setUpdating(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const formatCurrency = (n) => Number(n || 0).toFixed(2);

  if (loading) {
    return (
      <div className="card p-4">
        <div className="placeholder-glow">
          <span className="placeholder col-12"></span>
          <span className="placeholder col-9"></span>
          <span className="placeholder col-6"></span>
        </div>
      </div>
    );
  }

  return (
    <div className="card admin-orders-card">
      <div className="card-header admin-orders-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Orders</h5>
        <button className="btn btn-sm btn-light admin-refresh-btn" onClick={fetchOrders}>
          Refresh
        </button>
      </div>
      <div className="card-body">
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="text-center text-muted">No orders found.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle admin-orders-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th className="text-end">Total</th>
                  <th>Items</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id}>
                    <td>
                      <div className="fw-semibold">#{order._id.slice(-8).toUpperCase()}</div>
                      <small className="text-muted">{order._id}</small>
                    </td>
                    <td>
                      <div>{order.user?.name || '—'}</div>
                      <small className="text-muted">{order.user?.email || ''}</small>
                    </td>
                    <td>{new Date(order.createdAt).toLocaleString()}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <select
                          className={`form-select form-select-sm status-select status-${statusClass(order.orderStatus)}`}
                          value={order.orderStatus}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          disabled={updating[order._id]}
                        >
                          {statusOptions.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        <span className={`status-chip status-${statusClass(order.orderStatus)}`}>{order.orderStatus}</span>
                        {updating[order._id] && (
                          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        )}
                      </div>
                    </td>
                    <td className="text-end">₱{formatCurrency(order.totalPrice)}</td>
                    <td>
                      <span className="badge items-badge">{order.orderItems?.length || 0} ITEMS</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersManagement;