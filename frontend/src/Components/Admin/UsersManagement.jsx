import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Modal, Button, Badge } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { auth } from '../../utils/firebase';

const UsersManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [showUserModal, setShowUserModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [updatingRole, setUpdatingRole] = useState({}); // { [userId]: boolean }
    const [updatingStatus, setUpdatingStatus] = useState({}); // { [userId]: boolean }
    const [deletingUser, setDeletingUser] = useState({}); // { [userId]: boolean }
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null); // { _id, name, email, avatar }
    const { isAuthenticated, loading: authLoading } = useAuth();

    useEffect(() => {
        if (isAuthenticated && !authLoading) {
            fetchUsers();
        }
    }, [isAuthenticated, authLoading]);

    const getAuthConfig = async () => {
        try {
            const token = await auth.currentUser?.getIdToken(true);
            if (token) return { headers: { Authorization: `Bearer ${token}` } };
        } catch (_) {}
        return {};
    };

    const fetchUsers = async () => {
        try {
            const config = await getAuthConfig();
            const { data } = await axios.get(`/admin/users`, config);
            setUsers(data.users || []);
            setLoading(false);
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to fetch users';
            toast.error(msg);
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            setUpdatingRole(prev => ({ ...prev, [userId]: true }));
            const authCfg = await getAuthConfig();
            const config = { headers: { ...(authCfg.headers || {}), 'Content-Type': 'application/json' } };

            await axios.put(`/admin/user/${userId}`, { role: newRole }, config);
            // Re-sync with server to reflect DB state
            await fetchUsers();
            
            toast.success(`User role updated to ${newRole}`);
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to update user role';
            toast.error(msg);
        } finally {
            setUpdatingRole(prev => ({ ...prev, [userId]: false }));
        }
    };

    const openDeleteModal = (user) => {
        setDeleteTarget(user);
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setDeleteTarget(null);
    };

    const confirmDeleteUser = async () => {
        if (!deleteTarget?._id) return;
        const userId = deleteTarget._id;
        try {
            setDeletingUser(prev => ({ ...prev, [userId]: true }));
            const config = await getAuthConfig();
            await axios.delete(`/admin/user/${userId}`, config);
            await fetchUsers();
            toast.success('User deleted successfully');
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to delete user';
            toast.error(msg);
        } finally {
            setDeletingUser(prev => ({ ...prev, [userId]: false }));
            closeDeleteModal();
        }
    };

    const handleToggleActive = async (userId, nextActive) => {
        try {
            setUpdatingStatus(prev => ({ ...prev, [userId]: true }));
            const authCfg = await getAuthConfig();
            const config = { headers: { ...(authCfg.headers || {}), 'Content-Type': 'application/json' } };
            await axios.put(`/admin/user/${userId}/status`, { isActive: nextActive }, config);
            await fetchUsers();
            toast.success(`User ${nextActive ? 'activated' : 'deactivated'}`);
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to update user status';
            toast.error(msg);
        } finally {
            setUpdatingStatus(prev => ({ ...prev, [userId]: false }));
        }
    };

    const openUserModal = (user) => {
        setSelectedUser(user);
        setShowUserModal(true);
    };

    const closeUserModal = () => {
        setSelectedUser(null);
        setShowUserModal(false);
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'all' || user.role === filterRole;
        return matchesSearch && matchesRole;
    });

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return <div className="loading">Loading users...</div>;
    }

    return (
        <div className="users-container">
            {/* Page Header */}
            <div className="page-header">
                <div className="header-content">
                    <h1 className="page-title">Users Management</h1>
                    <p className="page-subtitle">Manage your store efficiently</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="card stat-card">
                    <div className="stat-icon total-users">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                        </svg>
                    </div>
                    <div className="stat-content">
                        <div className="stat-number">{users.length}</div>
                        <div className="stat-label">Total Users</div>
                    </div>
                </div>

                <div className="card stat-card">
                    <div className="stat-icon admin-users">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                    </div>
                    <div className="stat-content">
                        <div className="stat-number">{users.filter(u => u.role === 'admin').length}</div>
                        <div className="stat-label">Admins</div>
                    </div>
                </div>

                <div className="card stat-card">
                    <div className="stat-icon regular-users">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                        </svg>
                    </div>
                    <div className="stat-content">
                        <div className="stat-number">{users.filter(u => u.role === 'user').length}</div>
                        <div className="stat-label">Regular Users</div>
                    </div>
                </div>
            </div>

            {/* Filters Card */}
            <div className="card filters-card">
                <div className="card-header">
                    <h3>Filter Users</h3>
                </div>
                <div className="card-body">
                    <div className="filters-grid">
                        <div className="search-group">
                            <label htmlFor="search">Search Users</label>
                            <div className="search-input-wrapper">
                                <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="11" cy="11" r="8"/>
                                    <path d="M21 21l-4.35-4.35"/>
                                </svg>
                                <input
                                    id="search"
                                    type="text"
                                    placeholder="Search users by name or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="search-input"
                                />
                            </div>
                        </div>
                        <div className="filter-group">
                            <label htmlFor="role-filter">Filter by Role</label>
                            <select
                                id="role-filter"
                                value={filterRole}
                                onChange={(e) => setFilterRole(e.target.value)}
                                className="filter-select"
                            >
                                <option value="all">All Roles</option>
                                <option value="user">Users</option>
                                <option value="admin">Admins</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Users Table Card */}
            <div className="card table-card">
                <div className="card-header">
                    <h3>Users List</h3>
                    <div className="table-actions">
                        <span className="results-count">{filteredUsers.length} users found</span>
                    </div>
                </div>
                <div className="card-body">
                    <div className="table-wrapper">
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Joined Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map(user => (
                                    <tr key={user._id} className="user-row">
                                        <td>
                                            <div className="user-info">
                                                <img 
                                                    src={user.avatar?.url || 'https://via.placeholder.com/50'} 
                                                    alt={user.name}
                                                    className="user-avatar"
                                                />
                                                <div className="user-details">
                                                    <span className="user-name">{user.name}</span>
                                                    <span className="user-id">ID: {user._id}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="user-email">{user.email}</span>
                                        </td>
                                        <td>
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                                className={`role-badge role-${user.role}`}
                                                disabled={!!updatingRole[user._id]}
                                            >
                                                <option value="user">User</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${user.isActive ? 'status-active' : 'status-inactive'}`}>
                                                {user.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="join-date">{formatDate(user.createdAt)}</span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button 
                                                    className="btn btn-sm btn-outline"
                                                    onClick={() => openUserModal(user)}
                                                    title="View Details"
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                                        <circle cx="12" cy="12" r="3"/>
                                                    </svg>
                                                </button>
                                                <button
                                                    className={`btn btn-sm ${user.isActive ? 'btn-warning' : 'btn-success'}`}
                                                    onClick={() => handleToggleActive(user._id, !user.isActive)}
                                                    disabled={!!updatingStatus[user._id]}
                                                    title={user.isActive ? 'Deactivate User' : 'Activate User'}
                                                >
                                                    {user.isActive ? 'Deactivate' : 'Activate'}
                                                    {updatingStatus[user._id] && (
                                                        <span className="spinner-border spinner-border-sm ms-2" role="status" aria-hidden="true"></span>
                                                    )}
                                                </button>
                                                <button 
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => openDeleteModal(user)}
                                                    disabled={user.role === 'admin' || !!deletingUser[user._id]}
                                                    title="Delete User"
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <polyline points="3,6 5,6 21,6"/>
                                                        <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"/>
                                                        <line x1="10" y1="11" x2="10" y2="17"/>
                                                        <line x1="14" y1="11" x2="14" y2="17"/>
                                                    </svg>
                                                    {deletingUser[user._id] && (
                                                        <span className="spinner-border spinner-border-sm ms-2" role="status" aria-hidden="true"></span>
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* No Results */}
            {filteredUsers.length === 0 && (
                <div className="card empty-state">
                    <div className="card-body">
                        <div className="empty-content">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                                <circle cx="9" cy="7" r="4"/>
                                <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                            </svg>
                            <h3>No users found</h3>
                            <p>No users match your current search criteria. Try adjusting your filters.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* View User Modal */}
            <Modal show={showUserModal} onHide={closeUserModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>User Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedUser && (
                        <div className="d-flex flex-column gap-3">
                            <div className="d-flex align-items-center gap-3">
                                <img
                                    src={selectedUser.avatar?.url || 'https://via.placeholder.com/80'}
                                    alt={selectedUser.name}
                                    style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }}
                                />
                                <div>
                                    <div className="fw-semibold" style={{ fontSize: '1.1rem' }}>{selectedUser.name}</div>
                                    <div className="text-muted">{selectedUser.email}</div>
                                    <div className="mt-2">
                                        <Badge bg={selectedUser.role === 'admin' ? 'warning' : 'primary'} text={selectedUser.role === 'admin' ? 'dark' : 'light'}>
                                            {selectedUser.role.toUpperCase()}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <hr />

                            <div className="row">
                                <div className="col-12 col-md-6 mb-3">
                                    <div className="text-muted small">User ID</div>
                                    <div className="fw-medium">{selectedUser._id}</div>
                                </div>
                                <div className="col-12 col-md-6 mb-3">
                                    <div className="text-muted small">Joined</div>
                                    <div className="fw-medium">{formatDate(selectedUser.createdAt)}</div>
                                </div>
                                <div className="col-12 col-md-6 mb-3">
                                    <div className="text-muted small">Email Verified</div>
                                    <div className="fw-medium">{selectedUser.isEmailVerified ? 'Yes' : 'No'}</div>
                                </div>
                                <div className="col-12 col-md-6 mb-3">
                                    <div className="text-muted small">Account Status</div>
                                    <div className="fw-medium">{selectedUser.isActive ? 'Active' : 'Inactive'}</div>
                                </div>
                                <div className="col-12 col-md-6 mb-3">
                                    <div className="text-muted small">Role</div>
                                    <div className="fw-medium">{selectedUser.role}</div>
                                </div>
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeUserModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={closeDeleteModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Delete User</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {deleteTarget && (
                        <div className="d-flex flex-column gap-3">
                            <div className="d-flex align-items-center gap-3">
                                <img
                                    src={deleteTarget.avatar?.url || 'https://via.placeholder.com/64'}
                                    alt={deleteTarget.name}
                                    style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }}
                                />
                                <div>
                                    <div className="fw-semibold" style={{ fontSize: '1.05rem' }}>{deleteTarget.name}</div>
                                    <div className="text-muted small">{deleteTarget.email}</div>
                                </div>
                            </div>

                            <div className="alert alert-warning mb-0" role="alert">
                                This action is permanent and cannot be undone.
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeDeleteModal}>Cancel</Button>
                    <Button variant="danger" onClick={confirmDeleteUser} disabled={!!deletingUser[deleteTarget?._id]}>Delete</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default UsersManagement;