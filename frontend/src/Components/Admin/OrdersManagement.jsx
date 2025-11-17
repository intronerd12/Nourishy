import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/AdminOrders.css';
import DataTable from 'react-data-table-component';

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

  // DataTable columns
  // Improved table spacing and readability
  const tableStyles = {
    table: { style: { width: '100%' } },
    headRow: { style: { minHeight: '58px', backgroundColor: '#f7fafc', borderBottom: '1px solid #e2e8f0' } },
    headCells: { style: { fontSize: '14px', fontWeight: 700, color: '#2d3748', padding: '14px 18px' } },
    rows: { style: { minHeight: '60px', fontSize: '14px' } },
    cells: { style: { padding: '14px 18px' } },
    pagination: { style: { padding: '10px 16px' } }
  };

  const columns = [
    {
      name: 'Order',
      selector: row => row.id,
      sortable: false,
      grow: 1,
      cell: (row) => (
        <div>
          <div className="fw-semibold">#{String(row.id).slice(-8).toUpperCase()}</div>
          <small className="text-muted">{row.id}</small>
        </div>
      ),
    },
    {
      name: 'Customer',
      selector: row => row.customerName,
      sortable: false,
      grow: 2,
      cell: (row) => (
        <div>
          <div>{row.customerName || '—'}</div>
          <small className="text-muted">{row.customerEmail || ''}</small>
        </div>
      ),
    },
    {
      name: 'Date',
      selector: row => row.createdAt,
      sortable: true,
      width: '220px',
      cell: (row) => new Date(row.createdAt).toLocaleString(),
    },
    {
      name: 'Status',
      sortable: false,
      width: '320px',
      cell: (row) => (
        <div className="d-flex align-items-center gap-2" style={{ width: '100%' }}>
          <select
            className={`form-select form-select-sm status-select status-${statusClass(row.orderStatus)}`}
            value={row.orderStatus}
            onChange={(e) => handleStatusChange(row.id, e.target.value)}
            disabled={Boolean(updating[row.id])}
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <span className={`status-chip status-${statusClass(row.orderStatus)}`}>{row.orderStatus}</span>
          {updating[row.id] && (
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          )}
        </div>
      ),
    },
    {
      name: 'Total',
      selector: row => row.totalPrice,
      sortable: true,
      width: '160px',
      cell: (row) => (
        <div style={{ textAlign: 'right', width: '100%' }}>
          ₱{formatCurrency(row.totalPrice)}
        </div>
      ),
    },
    {
      name: 'Items',
      selector: row => row.itemsCount,
      sortable: true,
      width: '140px',
      cell: (row) => (
        <span className="badge items-badge">{row.itemsCount || 0} ITEMS</span>
      ),
    },
  ];

  const rows = (orders || []).map((order) => ({
    id: order._id,
    customerName: order.user?.name || '—',
    customerEmail: order.user?.email || '',
    createdAt: order.createdAt,
    orderStatus: order.orderStatus,
    totalPrice: order.totalPrice,
    itemsCount: order.orderItems?.length || 0,
  }));

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

        {rows.length === 0 ? (
          <div className="text-center text-muted">No orders found.</div>
        ) : (
          <DataTable
            columns={columns}
            data={rows}
            customStyles={tableStyles}
            pagination
            paginationPerPage={10}
            paginationRowsPerPageOptions={[5, 10, 20]}
            highlightOnHover
            responsive
            dense
          />
        )}
      </div>
    </div>
  );
};

export default OrdersManagement;