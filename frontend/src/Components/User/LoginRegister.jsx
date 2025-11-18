import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import Loader from '../Layout/Loader'
import MetaData from '../Layout/MetaData'
import { useAuth } from '../../contexts/AuthContext'
import * as Yup from 'yup'

const LoginRegister = () => {
    const { login, register, loginWithGoogle, loading, isAuthenticated, user } = useAuth()
    
    const [loginData, setLoginData] = useState({
        email: '',
        password: ''
    })
    const [loginErrors, setLoginErrors] = useState({})

    const [registerData, setRegisterData] = useState({
        name: '',
        email: '',
        password: '',
        avatar: ''
    })
    const [avatarPreview, setAvatarPreview] = useState('/images/default_avatar.jpg')
    const [registerErrors, setRegisterErrors] = useState({})

    const loginSchema = Yup.object().shape({
        email: Yup.string().trim().email('Enter a valid email').required('Email is required'),
        password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required')
    })

    const registerSchema = Yup.object().shape({
        name: Yup.string().trim().min(2, 'Name must be at least 2 characters').required('Name is required'),
        email: Yup.string().trim().email('Enter a valid email').required('Email is required'),
        password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
        avatar: Yup.string().required('Avatar image is required')
    })

    const [activeTab, setActiveTab] = useState('login')

    const navigate = useNavigate()
    const location = useLocation()

    // Resolve redirect path from query or navigation state
    const searchParams = new URLSearchParams(location.search)
    const redirectRaw = searchParams.get('redirect') || ''
    const redirectFromState = location.state?.from || ''
    const redirectCandidate = redirectRaw || redirectFromState
    const redirectPath = redirectCandidate
        ? (redirectCandidate.startsWith('/') ? redirectCandidate : `/${redirectCandidate}`)
        : ''

    useEffect(() => {
        if (location.pathname === '/register') {
            setActiveTab('register')
        } else {
            setActiveTab('login')
        }
    }, [location.pathname])

    useEffect(() => {
        if (isAuthenticated && user) {
            // Redirect based on user role
            if (user.role === 'admin') {
                navigate('/admin/dashboard')
            } else {
                navigate(redirectPath || '/')
            }
        }
    }, [isAuthenticated, user, navigate, redirectPath])

    const handleLoginSubmit = async (e) => {
        e.preventDefault()
        try {
            setLoginErrors({})
            await loginSchema.validate(loginData, { abortEarly: false })
        } catch (error) {
            if (error?.name === 'ValidationError') {
                const fieldErrors = {}
                error.inner.forEach(err => {
                    if (err.path && !fieldErrors[err.path]) fieldErrors[err.path] = err.message
                })
                setLoginErrors(fieldErrors)
                toast.error('Please fix the validation errors')
                return
            }
        }
        const result = await login(loginData.email, loginData.password)
        if (result.success) {
            // Navigation is handled in useEffect above
        }
    }

    const handleRegisterSubmit = async (e) => {
        e.preventDefault()
        try {
            setRegisterErrors({})
            await registerSchema.validate(registerData, { abortEarly: false })
        } catch (error) {
            if (error?.name === 'ValidationError') {
                const fieldErrors = {}
                error.inner.forEach(err => {
                    if (err.path && !fieldErrors[err.path]) fieldErrors[err.path] = err.message
                })
                setRegisterErrors(fieldErrors)
                toast.error('Please fix the validation errors')
                return
            }
        }
        
        const userData = {
            name: registerData.name,
            email: registerData.email,
            password: registerData.password,
            avatar: registerData.avatar
        }

        const result = await register(userData)
        if (result.success) {
            setActiveTab('login')
            setRegisterData({ name: '', email: '', password: '' })
        }
    }

    const handleLoginChange = (e) => {
        setLoginData({ ...loginData, [e.target.name]: e.target.value })
    }

    const handleRegisterChange = (e) => {
        const { name, files, value } = e.target
        if (name === 'avatar' && files && files[0]) {
            const reader = new FileReader()
            reader.onload = () => {
                if (reader.readyState === 2) {
                    setAvatarPreview(reader.result)
                    setRegisterData(prev => ({ ...prev, avatar: reader.result }))
                }
            }
            reader.readAsDataURL(files[0])
        } else {
            setRegisterData({ ...registerData, [name]: value })
        }
    }

    useEffect(() => {
        if (isAuthenticated && redirectPath === '/shipping') {
            navigate('/shipping')
        }
    }, [])

    return (
        <React.Fragment>
            <MetaData title={activeTab === 'login' ? 'Login' : 'Register'} />
            
            {loading && <Loader />}
            
            <div className="py-5" style={{
                position: 'relative',
                minHeight: 'calc(100vh - 200px)',
                paddingBottom: '8rem',
                background: 'linear-gradient(135deg, var(--primary-bg) 0%, rgba(var(--primary-rgb), 0.08) 50%, var(--primary-bg) 100%)'
            }}>
                {/* Decorative background elements */}
                <div className="position-absolute top-0 end-0 w-25 h-25 rounded-circle" style={{
                    background: 'rgba(var(--primary-rgb), 0.15)',
                    filter: 'blur(100px)',
                    opacity: '0.3'
                }}></div>
                <div className="position-absolute bottom-0 start-0 w-25 h-25 rounded-circle" style={{
                    background: 'rgba(var(--primary-rgb), 0.22)',
                    filter: 'blur(80px)',
                    opacity: '0.2'
                }}></div>
                
                {/* Page heading moved above the auth container to free space */}
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-12 col-md-10 col-lg-8">
                            <div className="text-center mb-4">
                                <h1 className="fw-bold mb-2" style={{color: 'var(--primary-dark)'}}>
                                    <i className="fas fa-leaf me-2"></i>
                                    Nourishy
                                </h1>
                                <p className="text-muted">Welcome back to your natural beauty journey</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container position-relative">
                    <div className="row justify-content-center">
                        <div className="col-12 col-md-8 col-lg-6">
                            {/* Brand header removed from inside the container */}
                            
                            <div className="card border-0" style={{
                                borderRadius: '1.5rem',
                                boxShadow: '0 20px 40px rgba(var(--primary-rgb), 0.1)',
                                backdropFilter: 'blur(10px)',
                                background: 'rgba(255, 255, 255, 0.95)'
                            }}>
                                <div className="card-header bg-transparent border-0 p-0">
                                    <div className="d-flex" style={{
                                        borderRadius: '1.5rem 1.5rem 0 0',
                                        background: 'linear-gradient(135deg, var(--primary-bg), rgba(var(--primary-rgb), 0.08))'
                                    }}>
                                        <button 
                                            className={`nav-link flex-fill text-center py-3 border-0 fw-semibold transition-all ${
                                                activeTab === 'login' 
                                                    ? 'bg-white shadow-sm' 
                                                    : 'text-muted hover:bg-white/50'
                                            }`}
                                            onClick={() => {
                                                setActiveTab('login')
                                                const qs = redirectRaw ? `?redirect=${encodeURIComponent(redirectRaw)}` : ''
                                                navigate(`/login${qs}`, { state: location.state })
                                            }}
                                            style={{
                                                borderRadius: '1.5rem 0 0 0',
                                                color: activeTab === 'login' ? 'var(--primary-dark)' : 'var(--gray-600)',
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            <i className="fas fa-sign-in-alt me-2"></i>
                                            Login
                                        </button>
                                        <button 
                                            className={`nav-link flex-fill text-center py-3 border-0 fw-semibold transition-all ${
                                                activeTab === 'register' 
                                                    ? 'bg-white shadow-sm' 
                                                    : 'text-muted hover:bg-white/50'
                                            }`}
                                            onClick={() => {
                                                setActiveTab('register')
                                                const qs = redirectRaw ? `?redirect=${encodeURIComponent(redirectRaw)}` : ''
                                                navigate(`/register${qs}`, { state: location.state })
                                            }}
                                            style={{
                                                borderRadius: '0 1.5rem 0 0',
                                                color: activeTab === 'register' ? 'var(--primary-dark)' : 'var(--gray-600)',
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            <i className="fas fa-user-plus me-2"></i>
                                            Register
                                        </button>
                                    </div>
                                </div>

                                {/* Tab Content */}
                                <div className="card-body p-5">
                                    {activeTab === 'login' ? (
                                        <form onSubmit={handleLoginSubmit} className="needs-validation" noValidate>
                                            <div className="text-center mb-4">
                                                <h2 className="fw-bold" style={{color: 'var(--emerald-700)'}}>Welcome Back</h2>
                                                <p className="text-muted">Sign in to your account</p>
                                            </div>

                                            <div className="mb-4">
                                                <label htmlFor="login_email" className="form-label fw-semibold mb-2" style={{color: 'var(--emerald-700)'}}>
                                                    <i className="fas fa-envelope me-2"></i>Email Address
                                                </label>
                                                <input
                                                    type="email"
                                                    id="login_email"
                                                    name="email"
                                                    className="form-control form-control-lg"
                                                    value={loginData.email}
                                                    onChange={handleLoginChange}
                                                    required
                                                    placeholder="Enter your email"
                                                    style={{
                                                        borderRadius: '0.75rem',
                                                        border: '2px solid var(--emerald-200)',
                                                        padding: '0.75rem 1rem',
                                                        transition: 'all 0.3s ease'
                                                    }}
                                                    onFocus={(e) => e.target.style.borderColor = 'var(--emerald-500)'}
                                                    onBlur={(e) => e.target.style.borderColor = 'var(--emerald-200)'}
                                                />
                                                {loginErrors.email && <small className="text-danger">{loginErrors.email}</small>}
                                            </div>

                                            <div className="mb-4">
                                                <label htmlFor="login_password" className="form-label fw-semibold mb-2" style={{color: 'var(--primary-dark)'}}>
                                                    <i className="fas fa-lock me-2"></i>Password
                                                </label>
                                                <input
                                                    type="password"
                                                    id="login_password"
                                                    name="password"
                                                    className="form-control form-control-lg"
                                                    value={loginData.password}
                                                    onChange={handleLoginChange}
                                                    required
                                                    placeholder="Enter your password"
                                                    style={{
                                                        borderRadius: '0.75rem',
                                                        border: '2px solid rgba(var(--primary-rgb), 0.2)',
                                                        padding: '0.75rem 1rem',
                                                        transition: 'all 0.3s ease'
                                                    }}
                                                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                                                    onBlur={(e) => e.target.style.borderColor = 'rgba(var(--primary-rgb), 0.2)'}
                                                />
                                                {loginErrors.password && <small className="text-danger">{loginErrors.password}</small>}
                                            </div>

                                            <div className="d-flex justify-content-end align-items-center mb-4">
                                                <button 
                                                    type="button"
                                                    onClick={() => setActiveTab('register')}
                                                    className="btn btn-link text-decoration-none fw-medium p-0"
                                                    style={{color: 'var(--emerald-600)'}}
                                                    onMouseEnter={(e) => e.target.style.color = 'var(--emerald-700)'}
                                                    onMouseLeave={(e) => e.target.style.color = 'var(--emerald-600)'}
                                                >
                                                    No account yet?
                                                </button>
                                            </div>

                                            <button
                                                type="submit"
                                                className="btn btn-lg w-100 fw-semibold mb-3"
                                                disabled={loading}
                                                style={{
                                                    background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                                                    border: 'none',
                                                    color: 'white',
                                                    borderRadius: '0.75rem',
                                                    padding: '0.75rem 1rem',
                                                    transition: 'all 0.3s ease',
                                                    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.target.style.transform = 'translateY(-2px)'
                                                    e.target.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)'
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.transform = 'translateY(0)'
                                                    e.target.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)'
                                                }}
                                            >
                                                {loading ? (
                                                    <React.Fragment>
                                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                        Signing In...
                                                    </React.Fragment>
                                                ) : (
                                                    <React.Fragment>
                                                        <i className="fas fa-sign-in-alt me-2"></i>
                                                        Sign In
                                                    </React.Fragment>
                                                )}
                                            </button>
                                            
                                            <div className="d-flex align-items-center my-3">
                                                <div className="flex-grow-1" style={{ height: 1, background: 'rgba(var(--primary-rgb), 0.2)' }}></div>
                                                <span className="px-3 text-muted">or</span>
                                                <div className="flex-grow-1" style={{ height: 1, background: 'var(--emerald-200)' }}></div>
                                            </div>

                                            <button
                                                type="button"
                                                className="btn btn-lg w-100 fw-semibold mb-2"
                                                disabled={loading}
                                                onClick={() => loginWithGoogle && loginWithGoogle()}
                                                style={{
                                                    background: '#ffffff',
                                                    border: '2px solid var(--emerald-200)',
                                                    color: 'var(--gray-800)',
                                                    borderRadius: '0.75rem',
                                                    padding: '0.75rem 1rem',
                                                    transition: 'all 0.3s ease'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.target.style.transform = 'translateY(-2px)'
                                                    e.target.style.borderColor = 'var(--emerald-400)'
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.transform = 'translateY(0)'
                                                    e.target.style.borderColor = 'var(--emerald-200)'
                                                }}
                                            >
                                                <i className="fab fa-google me-2" style={{ color: '#DB4437' }}></i>
                                                Continue with Google
                                            </button>
                                            
                                            <div className="text-center">
                                                <small className="text-muted">
                                                    By signing in, you agree to our 
                                                    <a href="#" className="text-decoration-none ms-1" style={{color: 'var(--emerald-600)'}}>
                                                        Terms & Conditions
                                                    </a>
                                                </small>
                                            </div>
                                        </form>
                                    ) : (
                                        <form onSubmit={handleRegisterSubmit} encType="multipart/form-data" className="needs-validation" noValidate>
                                            <div className="text-center mb-4">
                                                <h2 className="fw-bold" style={{color: 'var(--emerald-700)'}}>Create Account</h2>
                                                <p className="text-muted">Join our natural beauty community</p>
                                            </div>

                                            <div className="mb-4">
                                                <label htmlFor="register_name" className="form-label fw-semibold mb-2" style={{color: 'var(--emerald-700)'}}>
                                                    <i className="fas fa-user me-2"></i>Full Name
                                                </label>
                                                <input
                                                    type="text"
                                                    id="register_name"
                                                    name="name"
                                                    className="form-control form-control-lg"
                                                    value={registerData.name}
                                                    onChange={handleRegisterChange}
                                                    required
                                                    placeholder="Enter your full name"
                                                    style={{
                                                        borderRadius: '0.75rem',
                                                        border: '2px solid var(--emerald-200)',
                                                        padding: '0.75rem 1rem',
                                                        transition: 'all 0.3s ease'
                                                    }}
                                                    onFocus={(e) => e.target.style.borderColor = 'var(--emerald-500)'}
                                                    onBlur={(e) => e.target.style.borderColor = 'var(--emerald-200)'}
                                                />
                                                {registerErrors.name && <small className="text-danger">{registerErrors.name}</small>}
                                            </div>

                                            <div className="mb-4">
                                                <label htmlFor="register_email" className="form-label fw-semibold mb-2" style={{color: 'var(--emerald-700)'}}>
                                                    <i className="fas fa-envelope me-2"></i>Email Address
                                                </label>
                                                <input
                                                    type="email"
                                                    id="register_email"
                                                    name="email"
                                                    className="form-control form-control-lg"
                                                    value={registerData.email}
                                                    onChange={handleRegisterChange}
                                                    required
                                                    placeholder="Enter your email"
                                                    style={{
                                                        borderRadius: '0.75rem',
                                                        border: '2px solid var(--emerald-200)',
                                                        padding: '0.75rem 1rem',
                                                        transition: 'all 0.3s ease'
                                                    }}
                                                    onFocus={(e) => e.target.style.borderColor = 'var(--emerald-500)'}
                                                    onBlur={(e) => e.target.style.borderColor = 'var(--emerald-200)'}
                                                />
                                                {registerErrors.email && <small className="text-danger">{registerErrors.email}</small>}
                                            </div>

                                            <div className="mb-4">
                                                <label htmlFor="register_password" className="form-label fw-semibold mb-2" style={{color: 'var(--emerald-700)'}}>
                                                    <i className="fas fa-lock me-2"></i>Password
                                                </label>
                                                <input
                                                    type="password"
                                                    id="register_password"
                                                    name="password"
                                                    className="form-control form-control-lg"
                                                    value={registerData.password}
                                                    onChange={handleRegisterChange}
                                                    required
                                                    placeholder="Create a strong password"
                                                    style={{
                                                        borderRadius: '0.75rem',
                                                        border: '2px solid var(--emerald-200)',
                                                        padding: '0.75rem 1rem',
                                                        transition: 'all 0.3s ease'
                                                    }}
                                                    onFocus={(e) => e.target.style.borderColor = 'var(--emerald-500)'}
                                                    onBlur={(e) => e.target.style.borderColor = 'var(--emerald-200)'}
                                                />
                                                <small className="text-muted">
                                                    Password should be at least 6 characters long
                                                </small>
                                                {registerErrors.password && <small className="text-danger d-block">{registerErrors.password}</small>}
                                            </div>

                                            <div className="mb-4">
                                                <label htmlFor="register_avatar" className="form-label fw-semibold mb-2" style={{color: 'var(--emerald-700)'}}>
                                                    <i className="fas fa-image me-2"></i>Avatar
                                                </label>
                                                <div className="d-flex align-items-center">
                                                    <div className="me-3">
                                                        <figure className="avatar">
                                                            <img src={avatarPreview} alt="Avatar Preview" className="rounded-circle" style={{ width: '64px', height: '64px', objectFit: 'cover' }} />
                                                        </figure>
                                                    </div>
                                                    <input
                                                        type="file"
                                                        id="register_avatar"
                                                        name="avatar"
                                                        className="form-control"
                                                        accept="image/*"
                                                        onChange={handleRegisterChange}
                                                        required
                                                        style={{
                                                            borderRadius: '0.75rem',
                                                            border: '2px solid var(--emerald-200)',
                                                            padding: '0.5rem',
                                                            transition: 'all 0.3s ease'
                                                        }}
                                                    />
                                                </div>
                                                {registerErrors.avatar && <small className="text-danger d-block">{registerErrors.avatar}</small>}
                                            </div>

                                            <button
                                                type="submit"
                                                className="btn btn-lg w-100 fw-semibold mb-3"
                                                disabled={loading}
                                                style={{
                                                    background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                                                    border: 'none',
                                                    color: 'white',
                                                    borderRadius: '0.75rem',
                                                    padding: '0.75rem 1rem',
                                                    transition: 'all 0.3s ease',
                                                    boxShadow: '0 4px 15px rgba(var(--primary-rgb), 0.3)'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.target.style.transform = 'translateY(-2px)'
                                                    e.target.style.boxShadow = '0 6px 20px rgba(var(--primary-rgb), 0.4)'
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.transform = 'translateY(0)'
                                                    e.target.style.boxShadow = '0 4px 15px rgba(var(--primary-rgb), 0.3)'
                                                }}
                                            >
                                                {loading ? (
                                                    <React.Fragment>
                                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                        Creating Account...
                                                    </React.Fragment>
                                                ) : (
                                                    <React.Fragment>
                                                        <i className="fas fa-user-plus me-2"></i>
                                                        Create Account
                                                    </React.Fragment>
                                                )}
                                            </button>
                                            
                                            <div className="d-flex align-items-center my-3">
                                                <div className="flex-grow-1" style={{ height: 1, background: 'rgba(var(--primary-rgb), 0.2)' }}></div>
                                                <span className="px-3 text-muted">or</span>
                                                <div className="flex-grow-1" style={{ height: 1, background: 'var(--emerald-200)' }}></div>
                                            </div>

                                            <button
                                                type="button"
                                                className="btn btn-lg w-100 fw-semibold mb-2"
                                                disabled={loading}
                                                onClick={() => loginWithGoogle && loginWithGoogle()}
                                                style={{
                                                    background: '#ffffff',
                                                    border: '2px solid rgba(var(--primary-rgb), 0.2)',
                                                    color: 'var(--gray-800)',
                                                    borderRadius: '0.75rem',
                                                    padding: '0.75rem 1rem',
                                                    transition: 'all 0.3s ease'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.target.style.transform = 'translateY(-2px)'
                                                    e.target.style.borderColor = 'rgba(var(--primary-rgb), 0.35)'
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.transform = 'translateY(0)'
                                                    e.target.style.borderColor = 'rgba(var(--primary-rgb), 0.2)'
                                                }}
                                            >
                                                <i className="fab fa-google me-2" style={{ color: '#DB4437' }}></i>
                                                Continue with Google
                                            </button>
                                            
                                            <div className="text-center">
                                                <small className="text-muted">
                                                    By creating an account, you agree to our 
                                                    <a href="#" className="text-decoration-none ms-1" style={{color: 'var(--accent)'}}>
                                                        Terms & Conditions
                                                    </a> and 
                                                    <a href="#" className="text-decoration-none ms-1" style={{color: 'var(--accent)'}}>
                                                        Privacy Policy
                                                    </a>
                                                </small>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    )
}

export default LoginRegister