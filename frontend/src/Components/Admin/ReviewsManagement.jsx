import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Loader from '../Layout/Loader';
import { useAuth } from '../../contexts/AuthContext';

const ReviewsManagement = () => {
  const { loading: authLoading, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState('');

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await axios.get('/admin/reviews');
      if (data.success) {
        setReviews(data.reviews || []);
      } else {
        setError('Failed to load reviews');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchReviews();
    }
  }, [authLoading, isAuthenticated]);

  const handleDelete = async (productId, reviewId) => {
    if (!window.confirm('Delete this review? This cannot be undone.')) return;
    try {
      await axios.delete(`/admin/review/${productId}/${reviewId}`);
      toast.success('Review deleted');
      setReviews(prev => prev.filter(r => r.reviewId !== reviewId));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete review');
    }
  };

  if (authLoading || loading) return <Loader />;

  return (
    <div className="admin-section">
      <div className="section-header d-flex justify-content-end align-items-center mb-3">
        <button className="btn btn-outline-secondary" onClick={fetchReviews}>
          Refresh
        </button>
      </div>
      {error && (
        <div className="alert alert-danger">{error}</div>
      )}
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Product</th>
              <th>User</th>
              <th>Rating</th>
              <th>Comment</th>
              <th>Date</th>
              <th style={{ width: '120px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(reviews || []).map(r => (
              <tr key={r.reviewId}>
                <td>{r.productName}</td>
                <td>{r.userName}</td>
                <td>⭐ {r.rating}</td>
                <td style={{ maxWidth: '420px' }}>{r.comment}</td>
                <td>{new Date(r.createdAt).toLocaleString()}</td>
                <td>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(r.productId, r.reviewId)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {reviews.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center text-muted">No reviews found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReviewsManagement;