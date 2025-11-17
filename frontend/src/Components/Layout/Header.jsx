import React, { useState, useEffect } from 'react'

import '../../styles/App.css'

import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from 'react-toastify'



const Header = ({cartItems}) => {

    const { user, isAuthenticated, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    
    // Check if user is on login or register page
    const isOnAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/loginregister'

    const logoutHandler = async () => {
        await logout();
        navigate('/loginregister');
    }


    return (
        <>
            {/* Top banner removed per request */}

            {/* Navbar */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-primary-dark">
                <div className="container-fluid">
                    <Link className="navbar-brand d-flex align-items-center" to="/">
                        <span className="brand-text">Nourishy</span>
                    </Link>

                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                {/* UI Showcase removed per Unit 2 requirement */}
                            </li>
                            {!isOnAuthPage && isAuthenticated && (
                                <>
                                    <li className="nav-item">
                                        <Link className="nav-link" to="/">Home</Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link className="nav-link" to="/shop">Shop</Link>
                                    </li>

                                    {/* Orders moved to user dropdown; removed from top nav */}
                                    {user?.role === 'admin' && (
                                        <>
                                            <li className="nav-item">
                                                <Link className="nav-link" to="/create">Create</Link>
                                            </li>
                                            <li className="nav-item">
                                                <Link className="nav-link" to="/admin/dashboard">
                                                    <i className="fas fa-chart-bar me-1"></i>
                                                    Dashboard
                                                </Link>
                                            </li>
                                        </>
                                    )}
                                </>
                            )}
                        </ul>

                        {!isOnAuthPage && (
                            <div className="d-flex align-items-center gap-2">
                                {isAuthenticated && user ? (
                                    <div className="dropdown user-menu">
                                        <button className="btn user-menu-toggle dropdown-toggle" type="button" id="userMenu" data-bs-toggle="dropdown" aria-expanded="false">
                                            <span className="user-avatar">
                                                {(user?.name || 'U').charAt(0).toUpperCase()}
                                            </span>
                                            <span className="user-label">{user?.name || 'User'}</span>
                                        </button>
                                        <ul className="dropdown-menu dropdown-menu-end user-menu-dropdown" aria-labelledby="userMenu">
                                            <li className="user-menu-header">
                                                <span className="user-avatar small">
                                                    {(user?.name || 'U').charAt(0).toUpperCase()}
                                                </span>
                                                <div className="d-flex flex-column">
                                                    <strong className="name">{user?.name || 'User'}</strong>
                                                    <small className="text-muted">{user?.email}</small>
                                                </div>
                                            </li>
                                            {user?.role === 'admin' && (
                                                <li>
                                                    <Link className="dropdown-item" to="/admin/dashboard">
                                                        <i className="fas fa-chart-bar me-2 menu-icon"></i>
                                                        Admin Dashboard
                                                    </Link>
                                                </li>
                                            )}
                                            <li>
                                                <Link className="dropdown-item" to="/orders">
                                                    <i className="fas fa-shopping-bag me-2 menu-icon"></i>
                                                    Orders
                                                </Link>
                                            </li>
                                            <li>
                                                <Link className="dropdown-item" to="/me">
                                                    <i className="fas fa-user-circle me-2 menu-icon"></i>
                                                    Profile
                                                </Link>
                                            </li>
                                            <li><hr className="dropdown-divider user-menu-divider" /></li>
                                            <li>
                                                <button className="dropdown-item text-danger" onClick={logoutHandler}>
                                                    <i className="fas fa-sign-out-alt me-2 menu-icon"></i>
                                                    Logout
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                ) : (
                                    <div className="d-flex gap-2">
                                        <Link to="/loginregister" className="btn btn-outline-light">
                                            <i className="fas fa-sign-in-alt me-1"></i>
                                            Login
                                        </Link>
                                        <Link to="/register" className="btn btn-primary">
                                            <i className="fas fa-user-plus me-1"></i>
                                            Register
                                        </Link>
                                    </div>
                                )}

                                {isAuthenticated && (
                                    <Link to="/ordercart" className="btn btn-warning">
                                        <span id="cart" className="me-2">Cart</span>
                                        <span className="badge bg-dark" id="cart_count">{cartItems ? cartItems.length : 0}</span>
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </nav>
        </>
    )
}

export default Header