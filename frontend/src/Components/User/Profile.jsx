import React, { Fragment, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Loader from '../Layout/Loader'
import MetaData from '../Layout/MetaData'
import { useAuth } from '../../contexts/AuthContext'

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Profile = () => {
   
    const { user, loading, isAuthenticated } = useAuth();

    useEffect(() => {
        if (!isAuthenticated && !loading) {
            toast.error("Please login to access your profile", {
                position: 'bottom-center'
            });
        }
    }, [isAuthenticated, loading]);

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    if (loading) {
        return <Loader />;
    }

    if (!isAuthenticated || !user) {
        return (
            <div className="container text-center py-5">
                <h3>Please login to access your profile</h3>
                <Link to="/login" className="btn btn-primary mt-3">Login</Link>
            </div>
        );
    }

    return (
        <>
            <MetaData title={'Your Profile'} />

                    {/* Hero Section */}
                    <section className="position-relative overflow-hidden" style={{
                        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%)',
                        minHeight: '40vh'
                    }}>
                        {/* Background Pattern */}
                        <div className="position-absolute top-0 start-0 w-100 h-100" style={{
                            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(16, 185, 129, 0.05) 0%, transparent 50%),
                                             radial-gradient(circle at 75% 75%, rgba(16, 185, 129, 0.03) 0%, transparent 50%)`,
                            zIndex: 1
                        }}></div>
                        
                        <div className="container position-relative" style={{zIndex: 2}}>
                            <div className="row align-items-center py-5">
                                <div className="col-12 text-center">
                                    <div className="mb-4">
                                        <span className="badge rounded-pill px-4 py-2 fw-medium" style={{
                                            background: 'linear-gradient(45deg, var(--emerald-500), var(--emerald-600))',
                                            color: 'white',
                                            fontSize: '0.875rem',
                                            letterSpacing: '0.5px'
                                        }}>
                                            ✨ Your Nourishy Profile
                                        </span>
                                    </div>
                                    
                                    <h1 className="display-4 fw-bold mb-3" style={{
                                        lineHeight: '1.1',
                                        letterSpacing: '-0.02em'
                                    }}>
                                        <span className="text-dark">Welcome back,</span>
                                        <br/>
                                        <span style={{
                                            background: 'linear-gradient(135deg, var(--emerald-600), var(--emerald-500))',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            backgroundClip: 'text'
                                        }}>{user.name}</span>
                                    </h1>
                                    
                                    <p className="lead mb-0" style={{
                                        fontSize: '1.1rem',
                                        color: '#64748b',
                                        maxWidth: '600px',
                                        margin: '0 auto'
                                    }}>
                                        Manage your account, track your orders, and personalize your hair care journey
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Profile Content */}
                    <section className="py-5" style={{ backgroundColor: '#ffffff' }}>
                        <div className="container">
                            <div className="row justify-content-center">
                                <div className="col-12 col-lg-10">
                                    <div className="row g-4">
                                        {/* Profile Card */}
                                        <div className="col-12 col-md-4">
                                            <div className="card border-0 shadow-lg h-100" style={{
                                                borderRadius: '20px',
                                                background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
                                                overflow: 'hidden'
                                            }}>
                                                <div className="card-body text-center p-4">
                                                    {/* Avatar */}
                                                    <div className="position-relative mb-4">
                                                        <div className="mx-auto" style={{
                                                            width: '120px',
                                                            height: '120px',
                                                            borderRadius: '50%',
                                                            background: 'linear-gradient(135deg, var(--emerald-500), var(--emerald-600))',
                                                            padding: '4px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}>
                                                            <img 
                                                                className="rounded-circle" 
                                                                src={user.avatar ? user.avatar.url : '/images/default_avatar.jpg'} 
                                                                alt={user.name}
                                                                style={{
                                                                    width: '112px',
                                                                    height: '112px',
                                                                    objectFit: 'cover'
                                                                }}
                                                            />
                                                        </div>
                                                        
                                                        {/* Verification Badge */}
                                                        {user.isEmailVerified && (
                                                            <div className="position-absolute bottom-0 end-0" style={{
                                                                transform: 'translate(25%, 25%)'
                                                            }}>
                                                                <div className="bg-success rounded-circle d-flex align-items-center justify-content-center" style={{
                                                                    width: '32px',
                                                                    height: '32px',
                                                                    border: '3px solid white'
                                                                }}>
                                                                    <i className="fa fa-check text-white" style={{fontSize: '12px'}}></i>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    <h4 className="fw-bold mb-2" style={{color: '#1e293b'}}>{user.name}</h4>
                                                    <p className="text-muted mb-3">{user.email}</p>
                                                    
                                                    {/* Status Badge */}
                                                    <div className="mb-4">
                                                        <span className={`badge px-3 py-2 rounded-pill ${user.role === 'admin' ? 'bg-warning text-dark' : 'bg-primary'}`} style={{
                                                            fontSize: '0.875rem',
                                                            fontWeight: '500'
                                                        }}>
                                                            {user.role === 'admin' ? '👑 Admin' : '🌟 Member'}
                                                        </span>
                                                    </div>
                                                    
                                                    {/* Edit Profile Button */}
                                                    <Link 
                                                        to="/me/update" 
                                                        className="btn btn-primary btn-lg w-100 fw-semibold" 
                                                        style={{
                                                            background: 'var(--primary)',
                                                            border: 'none',
                                                            borderRadius: '12px',
                                                            color: 'white',
                                                            padding: '12px 24px',
                                                            transition: 'all 0.3s ease',
                                                            boxShadow: '0 4px 15px rgba(var(--primary-rgb), 0.3)'
                                                        }}
                                                    >
                                                        <i className="fa fa-edit me-2"></i>
                                                        Edit Profile
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Account Information */}
                                        <div className="col-12 col-md-8">
                                            <div className="card border-0 shadow-lg h-100" style={{
                                                borderRadius: '20px',
                                                background: 'linear-gradient(135deg, #ffffff, #f8fafc)'
                                            }}>
                                                <div className="card-body p-4">
                                                    <div className="d-flex align-items-center mb-4">
                                                        <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{
                                                            width: '48px',
                                                            height: '48px',
                                                            background: 'linear-gradient(135deg, var(--emerald-500), var(--emerald-600))'
                                                        }}>
                                                            <i className="fa fa-user text-white"></i>
                                                        </div>
                                                        <div>
                                                            <h3 className="fw-bold mb-1" style={{color: '#1e293b'}}>Account Information</h3>
                                                            <p className="text-muted mb-0">Your personal details and preferences</p>
                                                        </div>
                                                    </div>

                                                    <div className="row g-4">
                                                        {/* Full Name */}
                                                        <div className="col-12 col-sm-6">
                                                            <div className="p-3 rounded-3" style={{
                                                                background: 'rgba(var(--primary-rgb), 0.05)',
                                                                border: '1px solid rgba(var(--primary-rgb), 0.12)'
                                                            }}>
                                                                <div className="d-flex align-items-center mb-2">
                                                                    <i className="fa fa-user-circle text-primary me-2"></i>
                                                                    <small className="text-muted fw-medium text-uppercase" style={{letterSpacing: '0.5px'}}>Full Name</small>
                                                                </div>
                                                                <p className="fw-semibold mb-0" style={{color: '#1e293b', fontSize: '1.1rem'}}>{user.name}</p>
                                                            </div>
                                                        </div>

                                                        {/* Email Address */}
                                                        <div className="col-12 col-sm-6">
                                                            <div className="p-3 rounded-3" style={{
                                                                background: 'rgba(var(--primary-rgb), 0.05)',
                                                                border: '1px solid rgba(var(--primary-rgb), 0.12)'
                                                            }}>
                                                                <div className="d-flex align-items-center mb-2">
                                                                    <i className="fa fa-envelope text-primary me-2"></i>
                                                                    <small className="text-muted fw-medium text-uppercase" style={{letterSpacing: '0.5px'}}>Email Address</small>
                                                                </div>
                                                                <p className="fw-semibold mb-0" style={{color: '#1e293b', fontSize: '1.1rem'}}>{user.email}</p>
                                                                {user.isEmailVerified && (
                                                                    <small className="text-success fw-medium">
                                                                        <i className="fa fa-check-circle me-1"></i>
                                                                        Verified
                                                                    </small>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Member Since */}
                                                        <div className="col-12 col-sm-6">
                                                            <div className="p-3 rounded-3" style={{
                                                                background: 'rgba(16, 185, 129, 0.05)',
                                                                border: '1px solid rgba(16, 185, 129, 0.1)'
                                                            }}>
                                                                <div className="d-flex align-items-center mb-2">
                                                                    <i className="fa fa-calendar text-primary me-2"></i>
                                                                    <small className="text-muted fw-medium text-uppercase" style={{letterSpacing: '0.5px'}}>Member Since</small>
                                                                </div>
                                                                <p className="fw-semibold mb-0" style={{color: '#1e293b', fontSize: '1.1rem'}}>{formatDate(user.createdAt)}</p>
                                                            </div>
                                                        </div>

                                                        {/* Account Type */}
                                                        <div className="col-12 col-sm-6">
                                                            <div className="p-3 rounded-3" style={{
                                                                background: 'rgba(16, 185, 129, 0.05)',
                                                                border: '1px solid rgba(16, 185, 129, 0.1)'
                                                            }}>
                                                                <div className="d-flex align-items-center mb-2">
                                                                    <i className="fa fa-shield-alt text-primary me-2"></i>
                                                                    <small className="text-muted fw-medium text-uppercase" style={{letterSpacing: '0.5px'}}>Account Type</small>
                                                                </div>
                                                                <p className="fw-semibold mb-0" style={{color: '#1e293b', fontSize: '1.1rem'}}>
                                                                    {user.role === 'admin' ? 'Administrator' : 'Premium Member'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Action Buttons */}
                                                    <div className="row g-3 mt-4">
                                                        {user.role !== 'admin' && (
                                                            <div className="col-12 col-sm-6">
                                                                <Link 
                                                                    to="/orders/me" 
                                                                    className="btn btn-outline-primary btn-lg w-100 fw-semibold" 
                                                                    style={{
                                                                        borderRadius: '12px',
                                                                        borderWidth: '2px',
                                                                        padding: '12px 24px',
                                                                        transition: 'all 0.3s ease'
                                                                    }}
                                                                >
                                                                    <i className="fa fa-shopping-bag me-2"></i>
                                                                    My Orders
                                                                </Link>
                                                            </div>
                                                        )}
                                                        
                                                        <div className={`col-12 ${user.role !== 'admin' ? 'col-sm-6' : ''}`}>
                                                            <Link 
                                                                to="/password/update" 
                                                                className="btn btn-outline-secondary btn-lg w-100 fw-semibold" 
                                                                style={{
                                                                    borderRadius: '12px',
                                                                    borderWidth: '2px',
                                                                    padding: '12px 24px',
                                                                    transition: 'all 0.3s ease'
                                                                }}
                                                            >
                                                                <i className="fa fa-lock me-2"></i>
                                                                Change Password
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Stats Section */}
                    <section className="py-5" style={{
                        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%)'
                    }}>
                        <div className="container">
                            <div className="row justify-content-center">
                                <div className="col-12 col-lg-10">
                                    <div className="text-center mb-5">
                                        <h3 className="fw-bold" style={{color: '#1e293b'}}>Your Nourishy Journey</h3>
                                        <p className="text-muted">Track your progress and achievements</p>
                                    </div>
                                    
                                    <div className="row g-4">
                                        <div className="col-6 col-md-3">
                                            <div className="card border-0 shadow-sm text-center" style={{
                                                borderRadius: '16px',
                                                background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
                                                padding: '1rem'
                                            }}>
                                                <div className="card-body">
                                                    <div className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{
                                                        width: '60px',
                                                        height: '60px',
                                                        background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))'
                                                    }}>
                                                        <i className="fa fa-calendar text-white"></i>
                                                    </div>
                                                    <h4 className="fw-bold text-primary mb-1">
                                                        {Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24))}
                                                    </h4>
                                                    <small className="text-muted fw-medium">Days with us</small>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="col-6 col-md-3">
                                            <div className="card border-0 shadow-sm text-center" style={{
                                                borderRadius: '16px',
                                                background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
                                                padding: '1rem'
                                            }}>
                                                <div className="card-body">
                                                    <div className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{
                                                        width: '60px',
                                                        height: '60px',
                                                        background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))'
                                                    }}>
                                                        <i className="fa fa-check-circle text-white"></i>
                                                    </div>
                                                    <h4 className="fw-bold text-primary mb-1">
                                                        {user.isEmailVerified ? 'Verified' : 'Pending'}
                                                    </h4>
                                                    <small className="text-muted fw-medium">Account Status</small>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="col-6 col-md-3">
                                            <div className="card border-0 shadow-sm text-center" style={{
                                                borderRadius: '16px',
                                                background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
                                                padding: '1rem'
                                            }}>
                                                <div className="card-body">
                                                    <div className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{
                                                        width: '60px',
                                                        height: '60px',
                                                        background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))'
                                                    }}>
                                                        <i className="fa fa-star text-white"></i>
                                                    </div>
                                                    <h4 className="fw-bold text-primary mb-1">Premium</h4>
                                                    <small className="text-muted fw-medium">Membership</small>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="col-6 col-md-3">
                                            <div className="card border-0 shadow-sm text-center" style={{
                                                borderRadius: '16px',
                                                background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
                                                padding: '1rem'
                                            }}>
                                                <div className="card-body">
                                                    <div className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{
                                                        width: '60px',
                                                        height: '60px',
                                                        background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))'
                                                    }}>
                                                        <i className="fa fa-shield-alt text-white"></i>
                                                    </div>
                                                    <h4 className="fw-bold text-primary mb-1">
                                                        {user.role === 'admin' ? 'Admin' : 'User'}
                                                    </h4>
                                                    <small className="text-muted fw-medium">Role</small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
        </>
    )
}

export default Profile