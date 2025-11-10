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
        navigate('/');
    }


    return (
        <>
            {/* Top banner */}
            <div className="text-white text-center py-2 small bg-primary-dark">
                Free shipping on orders over ₱2,500 • 30-day money-back guarantee
            </div>

            {/* Navbar */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-primary-dark">
                <div className="container-fluid">
                    <Link className="navbar-brand d-flex align-items-center" to="/">
                        <img src="./images/nourishy_logo.svg" alt="Nourishy Hair Products" style={{height: '36px'}} />
                        <span className="ms-2 fw-semibold">Nourishy</span>
                    </Link>

                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <Link className="nav-link" to="/">Home</Link>
                            </li>
                            {!isOnAuthPage && isAuthenticated && (
                                <>
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
                                    <div className="dropdown">
                                        <button className="btn btn-outline-light dropdown-toggle" type="button" id="userMenu" data-bs-toggle="dropdown" aria-expanded="false">
                                            <span className="me-2">{user?.name || 'User'}</span>
                                        </button>
                                        <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userMenu">
                                            {user?.role === 'admin' && (
                                                <li><Link className="dropdown-item" to="/admin/dashboard">Admin Dashboard</Link></li>
                                            )}
                                            <li><Link className="dropdown-item" to="/orders">Orders</Link></li>
                                            <li><Link className="dropdown-item" to="/me">Profile</Link></li>
                                            <li><hr className="dropdown-divider" /></li>
                                            <li>
                                                <button className="dropdown-item text-danger" onClick={logoutHandler}>Logout</button>
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