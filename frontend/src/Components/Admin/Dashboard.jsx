import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MetaData from '../Layout/MetaData';
import Analytics from './Analytics';
import ProductsManagement from './ProductsManagement';
import UsersManagement from './UsersManagement';
import OrdersManagement from './OrdersManagement';
import ReviewsManagement from './ReviewsManagement';
import ErrorBoundary from '../Common/ErrorBoundary';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../assets/logo.svg';
import './Dashboard.css';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('analytics');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'analytics':
                return (
                    <ErrorBoundary>
                        <Analytics />
                    </ErrorBoundary>
                );
            case 'products':
                return (
                    <ErrorBoundary>
                        <ProductsManagement />
                    </ErrorBoundary>
                );
            case 'users':
                return (
                    <ErrorBoundary>
                        <UsersManagement />
                    </ErrorBoundary>
                );
            case 'orders':
                return (
                    <ErrorBoundary>
                        <OrdersManagement />
                    </ErrorBoundary>
                );
            case 'reviews':
                return (
                    <ErrorBoundary>
                        <ReviewsManagement />
                    </ErrorBoundary>
                );
            default:
                return (
                    <ErrorBoundary>
                        <Analytics />
                    </ErrorBoundary>
                );
        }
    };

    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    const menuItems = [
        { id: 'analytics', label: 'Analytics', icon: '📊' },
        { id: 'products', label: 'Products', icon: '📦' },
        { id: 'orders', label: 'Orders', icon: '🧾' },
        { id: 'reviews', label: 'Reviews', icon: '⭐' },
        { id: 'users', label: 'Users', icon: '👥' }
    ];

    const getPageTitle = () => {
        const currentItem = menuItems.find(item => item.id === activeTab);
        return currentItem ? currentItem.label : 'Dashboard';
    };

    return (
        <>
            <MetaData title="Admin Dashboard" />
            <div className="admin-dashboard">
                {/* Sidebar */}
                <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
                    <div className="sidebar-header">
                        <div className="logo-container">
                            <img src={logo} alt="Logo" className="sidebar-logo" />
                            <span className="logo-text">Nourishy Admin</span>
                        </div>
                        <button 
                            className="sidebar-toggle"
                            onClick={toggleSidebar}
                            aria-label="Toggle sidebar"
                        >
                            {sidebarCollapsed ? '→' : '←'}
                        </button>
                    </div>

                    <nav className="sidebar-nav">
                        <ul className="nav-list">
                            {menuItems.map((item) => (
                                <li key={item.id} className="nav-item">
                                    <button
                                        className={`nav-link ${activeTab === item.id ? 'active' : ''}`}
                                        onClick={() => setActiveTab(item.id)}
                                        title={sidebarCollapsed ? item.label : ''}
                                    >
                                        <span className="nav-icon">{item.icon}</span>
                                        {!sidebarCollapsed && <span className="nav-text">{item.label}</span>}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Removed sidebar logout to use the header logout in upper-right */}
                </div>

                {/* Main Content */}
                <div className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
                    <div className="content-header">
                        <div className="header-left">
                            <h1 className="page-title">{getPageTitle()}</h1>
                            <p className="page-subtitle">Manage your store efficiently</p>
                        </div>
                        <div className="header-right">
                            <div className="d-flex align-items-center gap-3">
                                <div className="user-info d-flex align-items-center gap-2">
                                    <div className="user-avatar">
                                        <i className="fas fa-user-circle"></i>
                                    </div>
                                    <span className="user-name">{user?.name || 'Admin User'}</span>
                                </div>
                                <button
                                    className="btn btn-outline-danger btn-sm"
                                    onClick={handleLogout}
                                    aria-label="Logout"
                                    title="Logout"
                                >
                                    <i className="fas fa-sign-out-alt me-1"></i>
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="content-body">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Dashboard;