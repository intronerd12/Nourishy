import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import MetaData from '../Layout/MetaData'
import axios from 'axios'
import { toast } from 'react-toastify'

const EmailVerification = () => {
    const [loading, setLoading] = useState(true)
    const [success, setSuccess] = useState('')
    const [error, setError] = useState('')
    const [resendLoading, setResendLoading] = useState(false)
    const [email, setEmail] = useState('')
    
    const { token } = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        if (token) {
            verifyEmail(token)
        } else {
            setLoading(false)
        }
    }, [token])

    const verifyEmail = async (verificationToken) => {
        try {
            const { data } = await axios.get(`http://localhost:4001/api/v1/verify-email/${verificationToken}`)
            
            setSuccess(data.message)
            setLoading(false)
            toast.success(data.message, {
                position: 'bottom-right'
            })
            
            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/login')
            }, 3000)
            
        } catch (error) {
            setLoading(false)
            const errorMessage = error.response?.data?.message || 'Email verification failed'
            setError(errorMessage)
            toast.error(errorMessage, {
                position: 'bottom-right'
            })
        }
    }

    const resendVerification = async (e) => {
        e.preventDefault()
        
        if (!email) {
            toast.error('Please enter your email address', {
                position: 'bottom-right'
            })
            return
        }

        setResendLoading(true)
        
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            
            const { data } = await axios.post('http://localhost:4001/api/v1/resend-verification', { email }, config)
            
            setResendLoading(false)
            toast.success(data.message, {
                position: 'bottom-right'
            })
            setEmail('')
            
        } catch (error) {
            setResendLoading(false)
            const errorMessage = error.response?.data?.message || 'Failed to resend verification email'
            toast.error(errorMessage, {
                position: 'bottom-right'
            })
        }
    }

    return (
        <>
            <MetaData title={'Email Verification'} />
            
            <div className="row wrapper">
                <div className="col-10 col-lg-5">
                    <div className="shadow-lg p-4">
                        {loading ? (
                            <div className="text-center">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="sr-only">Loading...</span>
                                </div>
                                <h4 className="mt-3">Verifying your email...</h4>
                            </div>
                        ) : (
                            <>
                                {success ? (
                                    <div className="text-center">
                                        <div className="mb-4">
                                            <i className="fa fa-check-circle text-success" style={{ fontSize: '4rem' }}></i>
                                        </div>
                                        <h2 className="text-success mb-3">Email Verified Successfully!</h2>
                                        <p className="mb-4">{success}</p>
                                        <div className="alert alert-success">
                                            <strong>Great!</strong> Your account is now verified and you can login to access all features.
                                        </div>
                                        <p className="text-muted">You will be redirected to the login page in a few seconds...</p>
                                        <Link to="/login" className="btn btn-primary">
                                            Go to Login
                                        </Link>
                                    </div>
                                ) : error ? (
                                    <div className="text-center">
                                        <div className="mb-4">
                                            <i className="fa fa-times-circle text-danger" style={{ fontSize: '4rem' }}></i>
                                        </div>
                                        <h2 className="text-danger mb-3">Verification Failed</h2>
                                        <p className="mb-4">{error}</p>
                                        
                                        <div className="mt-4">
                                            <h5>Resend Verification Email</h5>
                                            <form onSubmit={resendVerification} className="mt-3">
                                                <div className="form-group">
                                                    <input
                                                        type="email"
                                                        className="form-control"
                                                        placeholder="Enter your email address"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <button
                                                    type="submit"
                                                    className="btn btn-primary btn-block"
                                                    disabled={resendLoading}
                                                >
                                                    {resendLoading ? 'Sending...' : 'Resend Verification Email'}
                                                </button>
                                            </form>
                                        </div>
                                        
                                        <div className="mt-3">
                                            <Link to="/register" className="btn btn-outline-secondary mr-2">
                                                Register Again
                                            </Link>
                                            <Link to="/login" className="btn btn-outline-primary">
                                                Back to Login
                                            </Link>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <div className="mb-4">
                                            <i className="fa fa-envelope text-primary" style={{ fontSize: '4rem' }}></i>
                                        </div>
                                        <h2 className="mb-3">Email Verification</h2>
                                        <p className="mb-4">Please check your email for a verification link, or resend a new verification email below.</p>
                                        
                                        <form onSubmit={resendVerification}>
                                            <div className="form-group">
                                                <label htmlFor="email">Email Address</label>
                                                <input
                                                    type="email"
                                                    id="email"
                                                    className="form-control"
                                                    placeholder="Enter your email address"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                className="btn btn-primary btn-block"
                                                disabled={resendLoading}
                                            >
                                                {resendLoading ? 'Sending...' : 'Send Verification Email'}
                                            </button>
                                        </form>
                                        
                                        <div className="mt-3">
                                            <Link to="/login" className="btn btn-link">
                                                Back to Login
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default EmailVerification