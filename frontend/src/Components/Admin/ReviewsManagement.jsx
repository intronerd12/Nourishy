import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Modal, Button } from 'react-bootstrap';
import Loader from '../Layout/Loader';
import { useAuth } from '../../contexts/AuthContext';
import { auth } from '../../utils/firebase';

const ReviewsManagement = () => {
  const { loading: authLoading, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // { productId, reviewId, userName, comment }

  const getAuthConfig = async () => {
    try {
      const token = await auth.currentUser?.getIdToken(true);
      if (token) return { headers: { Authorization: `Bearer ${token}` } };
    } catch (_) {}
    return {};
  };

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError('');
      const config = await getAuthConfig();
      const { data } = await axios.get('/admin/reviews', config);
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

  const openDeleteModal = (review) => {
    setDeleteTarget(review);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const config = await getAuthConfig();
      await axios.delete(`/admin/review/${deleteTarget.productId}/${deleteTarget.reviewId}`, config);
      toast.success('Review deleted');
      setReviews(prev => prev.filter(r => r.reviewId !== deleteTarget.reviewId));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete review');
    } finally {
      closeDeleteModal();
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
                    onClick={() => openDeleteModal(r)}
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

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={closeDeleteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete Review</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {deleteTarget && (
            <div className="d-flex flex-column gap-2">
              <div>
                <strong>{deleteTarget.userName}</strong> on <em>{deleteTarget.productName}</em>
              </div>
              <div className="text-muted" style={{ maxHeight: 100, overflow: 'auto' }}>
                {deleteTarget.comment}
              </div>
              <div className="alert alert-warning mb-0" role="alert">
                This action is permanent and cannot be undone.
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeDeleteModal}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}>Delete</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ReviewsManagement;