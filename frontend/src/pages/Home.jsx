import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Pagination from '@mui/material/Pagination'
import Stack from '@mui/material/Stack'
import Product from '../Components/Product/Product'
import MetaData from '../Components/Layout/MetaData'
import Loader from '../Components/Layout/Loader'
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import { useAuth } from "../contexts/AuthContext";

const Home = () => {
    const [featuredProducts, setFeaturedProducts] = useState([])
    const [loading, setLoading] = useState(true)

    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const getFeaturedProducts = async () => {
        const res = await axios.get('/products/featured')
        setFeaturedProducts(res.data.products)
        setLoading(false)
    }

    useEffect(() => {
        getFeaturedProducts()
    }, []);

    // Helper function to handle guest redirection
    const handleGuestRedirection = (e, targetPath = '/search') => {
        if (!isAuthenticated) {
            e.preventDefault();
            navigate('/loginregister', { 
                state: { from: window.location.pathname } 
            });
            return false;
        }
        return true;
    };

    // Fallback images for products (high-quality hair product images)
    const fallbackImages = {
        'Shampoo': 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&h=400&fit=crop',
        'Conditioner': 'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=400&h=400&fit=crop',
        'Hair Oil': 'https://images.unsplash.com/photo-1570554886111-e80fcca6a029?w=400&h=400&fit=crop',
        'Hair Mask': 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop',
        'Hair Serum': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop',
        'Hair Spray': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=400&fit=crop'
    }

    if (loading) {
        return <Loader />
    }

    return (
        <>
            <MetaData title={'Nourishy Hair Products - Premium Featured Collection'} />
            
            {/* Enhanced Hero Section */}
            <section className="position-relative overflow-hidden" style={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%)',
                minHeight: '90vh'
            }}>
                {/* Background Pattern */}
                <div className="position-absolute top-0 start-0 w-100 h-100" style={{
                    backgroundImage: `radial-gradient(circle at 25% 25%, rgba(16, 185, 129, 0.05) 0%, transparent 50%),
                                     radial-gradient(circle at 75% 75%, rgba(16, 185, 129, 0.03) 0%, transparent 50%)`,
                    zIndex: 1
                }}></div>
                
                <div className="container position-relative" style={{zIndex: 2}}>
                    <div className="row align-items-center min-vh-100 py-5">
                        <div className="col-lg-6 pe-lg-5">
                            <div className="mb-4">
                                <span className="badge rounded-pill px-4 py-2 fw-medium" style={{
                                    background: 'linear-gradient(45deg, var(--emerald-500), var(--emerald-600))',
                                    color: 'white',
                                    fontSize: '0.875rem',
                                    letterSpacing: '0.5px'
                                }}>
                                    ✨ Naturally Nourishing Since 2020
                                </span>
                            </div>
                            
                            <h1 className="display-3 fw-bold mb-4" style={{
                                lineHeight: '1.1',
                                letterSpacing: '-0.02em'
                            }}>
                                <span className="text-dark">Premium Hair Care,</span>
                                <br/>
                                <span style={{
                                    background: 'linear-gradient(135deg, var(--emerald-600), var(--emerald-500))',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text'
                                }}>Naturally Crafted</span>
                            </h1>
                            
                            <p className="lead mb-5" style={{
                                fontSize: '1.25rem',
                                lineHeight: '1.6',
                                color: '#64748b',
                                maxWidth: '500px'
                            }}>
                                Professional-grade formulas infused with botanical ingredients to transform your hair care routine into a luxurious experience.
                            </p>
                            
                            <div className="d-flex flex-column flex-sm-row gap-3 mb-5">
                                <Link 
                                    to="/search" 
                                    className="btn btn-lg px-5 py-3 fw-semibold position-relative overflow-hidden" 
                                    style={{
                                        background: 'linear-gradient(135deg, var(--emerald-600), var(--emerald-500))',
                                        border: 'none',
                                        borderRadius: '12px',
                                        color: 'white',
                                        textDecoration: 'none',
                                        transition: 'all 0.3s ease',
                                        boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)'
                                    }}
                                    onClick={(e) => handleGuestRedirection(e, '/search')}
                                >
                                    <span className="d-flex align-items-center">
                                        Shop Collection 
                                        <i className="fa fa-arrow-right ms-2" style={{transition: 'transform 0.3s ease'}}/>
                                    </span>
                                </Link>
                                <Link 
                                    to="/search" 
                                    className="btn btn-outline-dark btn-lg px-5 py-3 fw-semibold" 
                                    style={{
                                        borderRadius: '12px',
                                        borderWidth: '2px',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onClick={(e) => handleGuestRedirection(e, '/search')}
                                >
                                    Browse Products
                                </Link>
                            </div>
                            
                            {/* Trust Indicators */}
                            <div className="d-flex align-items-center gap-4 text-muted">
                                <div className="d-flex align-items-center">
                                    <div className="rating-outer me-2">
                                        <div className="rating-inner" style={{ width: '100%' }}></div>
                                    </div>
                                    <small className="fw-medium">4.9/5 Rating</small>
                                </div>
                                <div className="d-flex align-items-center">
                                    <i className="fa fa-users me-2 text-primary"></i>
                                    <small className="fw-medium">10,000+ Happy Customers</small>
                                </div>
                            </div>
                        </div>
                        
                        <div className="col-lg-6 ps-lg-5">
                            <div className="position-relative">
                                {/* Main Product Image */}
                                <div className="position-relative mb-4">
                                    <div className="rounded-4 overflow-hidden shadow-lg" style={{
                                        background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
                                        padding: '2rem'
                                    }}>
                                        <img 
                                            className="img-fluid rounded-3" 
                                            alt="Premium Hair Care Products" 
                                            src="https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&h=500&fit=crop&q=80" 
                                            style={{
                                                width: '100%',
                                                height: '400px',
                                                objectFit: 'cover',
                                                filter: 'brightness(1.05) contrast(1.1)'
                                            }}
                                        />
                                    </div>
                                    
                                    {/* Floating Elements */}
                                    <div className="position-absolute top-0 end-0 translate-middle">
                                        <div className="bg-white rounded-circle shadow-lg p-3" style={{
                                            width: '80px',
                                            height: '80px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <div className="text-center">
                                                <div className="fw-bold text-primary">100%</div>
                                                <small className="text-muted" style={{fontSize: '0.7rem'}}>Natural</small>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="position-absolute bottom-0 start-0 translate-middle">
                                        <div className="bg-white rounded-3 shadow-lg p-3" style={{
                                            minWidth: '120px'
                                        }}>
                                            <div className="d-flex align-items-center">
                                                <i className="fa fa-award text-primary me-2"></i>
                                                <div>
                                                    <div className="fw-semibold" style={{fontSize: '0.875rem'}}>Award Winner</div>
                                                    <small className="text-muted">Best Hair Care 2024</small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Secondary Images */}
                                <div className="row g-3">
                                    <div className="col-6">
                                        <div className="rounded-3 overflow-hidden shadow" style={{height: '150px'}}>
                                            <img 
                                                className="img-fluid w-100 h-100" 
                                                alt="Hair Care Product" 
                                                src="https://images.unsplash.com/photo-1571875257727-256c39da42af?w=300&h=200&fit=crop&q=80" 
                                                style={{objectFit: 'cover'}}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="rounded-3 overflow-hidden shadow" style={{height: '150px'}}>
                                            <img 
                                                className="img-fluid w-100 h-100" 
                                                alt="Hair Care Product" 
                                                src="https://images.unsplash.com/photo-1570554886111-e80fcca6a029?w=300&h=200&fit=crop&q=80" 
                                                style={{objectFit: 'cover'}}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-5" style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                borderTop: '1px solid rgba(5, 150, 105, 0.1)',
                borderBottom: '1px solid rgba(5, 150, 105, 0.1)'
            }}>
                <div className="container">
                    <div className="row text-center g-4">
                        {[
                            {
                                icon: 'fa-leaf',
                                title: 'Natural Ingredients',
                                description: 'Plant-based formulas',
                                color: '#10b981',
                                delay: '0ms'
                            },
                            {
                                icon: 'fa-truck',
                                title: 'Free Shipping',
                                description: 'On orders over ₱2,500',
                                color: '#3b82f6',
                                delay: '100ms'
                            },
                            {
                                icon: 'fa-shield-halved',
                                title: 'Guaranteed Quality',
                                description: '30-day returns',
                                color: '#8b5cf6',
                                delay: '200ms'
                            },
                            {
                                icon: 'fa-gift',
                                title: 'Gift Ready',
                                description: 'Premium packaging',
                                color: '#f59e0b',
                                delay: '300ms'
                            }
                        ].map((feature, index) => (
                            <div key={index} className="col-6 col-md-3">
                                <div 
                                    className="feature-card h-100 p-4"
                                    style={{
                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                        animationDelay: feature.delay,
                                        borderRadius: '16px',
                                        background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
                                        border: '1px solid rgba(0, 0, 0, 0.05)',
                                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)'
                                        e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.1)'
                                        e.currentTarget.style.background = 'linear-gradient(145deg, #ffffff, #f0fdf4)'
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0) scale(1)'
                                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.05)'
                                        e.currentTarget.style.background = 'linear-gradient(145deg, #ffffff, #f8fafc)'
                                    }}
                                >
                                    <div 
                                        className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                                        style={{
                                            width: '60px',
                                            height: '60px',
                                            background: `linear-gradient(135deg, ${feature.color}15, ${feature.color}25)`,
                                            color: feature.color
                                        }}
                                    >
                                        <i className={`fa ${feature.icon} fa-lg`}></i>
                                    </div>
                                    <h5 className="fw-bold mb-2" style={{color: '#1f2937'}}>{feature.title}</h5>
                                    <p className="text-muted mb-0" style={{fontSize: '0.9rem'}}>{feature.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Products Section */}
            <section className="py-5" style={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #f1f5f9 100%)',
                minHeight: '80vh'
            }}>
                <div className="container">
                    <div className="text-center mb-5">
                        <div className="mb-4">
                            <span className="badge rounded-pill px-4 py-3 fw-bold" style={{
                                background: 'linear-gradient(45deg, #059669, #10b981)',
                                color: 'white',
                                fontSize: '1rem',
                                letterSpacing: '0.5px',
                                boxShadow: '0 8px 25px rgba(5, 150, 105, 0.3)'
                            }}>
                                ⭐ FEATURED COLLECTION ⭐
                            </span>
                        </div>
                        <h2 className="display-3 fw-bold text-dark mb-4" style={{
                            background: 'linear-gradient(135deg, #059669, #10b981)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            letterSpacing: '-0.02em'
                        }}>Our Premium Selection</h2>
                        <p className="lead text-secondary mb-5" style={{
                            fontSize: '1.3rem',
                            maxWidth: '600px',
                            margin: '0 auto',
                            lineHeight: '1.6'
                        }}>
                            Handpicked by our experts - these are the products our customers love most. 
                            Experience the difference with our top-rated hair care essentials.
                        </p>
                        
                        {/* Call to Action */}
                        <div className="mb-5">
                            <Link 
                                to="/shop" 
                                className="btn btn-lg px-5 py-3 fw-semibold" 
                                style={{
                                    background: 'linear-gradient(135deg, #059669, #10b981)',
                                    border: 'none',
                                    borderRadius: '12px',
                                    color: 'white',
                                    textDecoration: 'none',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 8px 25px rgba(5, 150, 105, 0.3)',
                                    fontSize: '1.1rem'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.transform = 'translateY(-3px)'
                                    e.target.style.boxShadow = '0 12px 35px rgba(5, 150, 105, 0.4)'
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = 'translateY(0)'
                                    e.target.style.boxShadow = '0 8px 25px rgba(5, 150, 105, 0.3)'
                                }}
                            >
                                <span className="d-flex align-items-center">
                                    Explore All Products 
                                    <i className="fa fa-arrow-right ms-2"/>
                                </span>
                            </Link>
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="row g-4">
                        {featuredProducts.map(product => (
                            <div key={product._id} className="col-12 col-sm-6 col-lg-3">
                                <div 
                                    className="card border-0 h-100 position-relative overflow-hidden"
                                    style={{
                                        borderRadius: '20px',
                                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                        background: 'linear-gradient(145deg, #ffffff, #f8fafc)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-12px) scale(1.02)'
                                        e.currentTarget.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.15)'
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0) scale(1)'
                                        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.08)'
                                    }}
                                >
                                    {/* Product Image Container */}
                                    <div className="position-relative overflow-hidden" style={{borderRadius: '20px 20px 0 0'}}>
                                        {/* Gradient Overlay */}
                                        <div className="position-absolute top-0 start-0 w-100 h-100" style={{
                                            background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
                                            opacity: 0,
                                            transition: 'opacity 0.3s ease',
                                            zIndex: 1
                                        }}></div>
                                        
                                        {/* Featured Badge */}
                                        <div className="position-absolute top-0 start-0 m-3" style={{zIndex: 2}}>
                                            <span className="badge px-3 py-2 fw-semibold" style={{
                                                background: 'linear-gradient(135deg, #059669, #10b981)',
                                                borderRadius: '12px',
                                                fontSize: '0.75rem',
                                                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
                                            }}>
                                                ⭐ Featured
                                            </span>
                                        </div>

                                        {/* Wishlist Button */}
                                        <div className="position-absolute top-0 end-0 m-3" style={{zIndex: 2}}>
                                            <button className="btn btn-light rounded-circle p-2" style={{
                                                width: '40px',
                                                height: '40px',
                                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                                opacity: 0,
                                                transition: 'all 0.3s ease'
                                            }}>
                                                <i className="fa fa-heart text-muted"></i>
                                            </button>
                                        </div>
                                        
                                        <img 
                                            src={product.images && product.images.length > 0 ? product.images[0].url : fallbackImages[product.category] || fallbackImages['Shampoo']} 
                                            alt={product.name} 
                                            className="card-img-top" 
                                            style={{
                                                height: '280px', 
                                                objectFit: 'cover',
                                                transition: 'transform 0.6s ease'
                                            }} 
                                            onError={(e) => {
                                                e.target.src = fallbackImages[product.category] || fallbackImages['Shampoo']
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.transform = 'scale(1.1)'
                                                e.target.parentElement.querySelector('.position-absolute').style.opacity = '1'
                                                e.target.parentElement.querySelector('.btn').style.opacity = '1'
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.transform = 'scale(1)'
                                                e.target.parentElement.querySelector('.position-absolute').style.opacity = '0'
                                                e.target.parentElement.querySelector('.btn').style.opacity = '0'
                                            }}
                                        />
                                    </div>
                                    
                                    {/* Card Body */}
                                    <div className="card-body d-flex flex-column p-4">
                                        {/* Category */}
                                        <span className="badge bg-light text-primary mb-2 align-self-start" style={{
                                            fontSize: '0.7rem',
                                            fontWeight: '600',
                                            borderRadius: '8px',
                                            padding: '4px 8px'
                                        }}>
                                            {product.category}
                                        </span>
                                        
                                        {/* Product Name */}
                                        <h5 className="card-title fw-bold mb-2" style={{
                                            fontSize: '1.1rem',
                                            lineHeight: '1.3',
                                            color: '#1f2937'
                                        }}>
                                            {product.name}
                                        </h5>
                                        
                                        {/* Description */}
                                        <p className="card-text text-muted mb-3" style={{
                                            fontSize: '0.875rem',
                                            lineHeight: '1.5',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                        }}>
                                            {product.description || 'Premium hair care product for healthy, beautiful hair.'}
                                        </p>
                                        
                                        {/* Rating */}
                                        <div className="d-flex align-items-center mb-3">
                                            <div className="rating-outer me-2">
                                                <div className="rating-inner" style={{ width: `${(product.ratings / 5) * 100}%` }}></div>
                                            </div>
                                            <small className="text-muted fw-medium">
                                                {product.ratings?.toFixed(1) || '4.5'} ({product.numOfReviews || 0} reviews)
                                            </small>
                                        </div>
                                        
                                        {/* Price and Action */}
                                        <div className="mt-auto">
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <div>
                                                    <span className="h5 fw-bold text-primary mb-0">₱{product.price}</span>
                                                    {product.price < 25 && (
                                                        <small className="text-muted text-decoration-line-through ms-2">
                                                            ₱{(product.price * 1.3).toFixed(2)}
                                                        </small>
                                                    )}
                                                </div>
                                                <div className="d-flex align-items-center text-success">
                                                    <i className="fa fa-check-circle me-1" style={{fontSize: '0.8rem'}}></i>
                                                    <small className="fw-medium">In Stock</small>
                                                </div>
                                            </div>
                                            
                                            <div className="d-grid gap-2">
                                                <Link 
                                                    to={`/product/${product._id}`} 
                                                    className="btn btn-primary fw-semibold py-2"
                                                    style={{
                                                        background: 'linear-gradient(135deg, #059669, #10b981)',
                                                        border: 'none',
                                                        borderRadius: '12px',
                                                        transition: 'all 0.3s ease',
                                                        boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.target.style.transform = 'translateY(-2px)'
                                                        e.target.style.boxShadow = '0 6px 20px rgba(5, 150, 105, 0.4)'
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.target.style.transform = 'translateY(0)'
                                                        e.target.style.boxShadow = '0 4px 12px rgba(5, 150, 105, 0.3)'
                                                    }}
                                                    onClick={(e) => handleGuestRedirection(e, `/product/${product._id}`)}
                                                >
                                                    View Details
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>


                </div>
            </section>

            {/* Newsletter */}
            <section 
                className="py-5 position-relative overflow-hidden"
                style={{
                    background: 'linear-gradient(135deg, #064e3b 0%, #059669 50%, #10b981 100%)',
                    minHeight: '400px'
                }}
            >
                {/* Background Pattern */}
                <div 
                    className="position-absolute w-100 h-100"
                    style={{
                        background: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
                        top: 0,
                        left: 0
                    }}
                ></div>
                
                <div className="container position-relative">
                    <div className="row align-items-center g-5">
                        <div className="col-md-6">
                            {/* Badge */}
                            <div 
                                className="d-inline-flex align-items-center px-3 py-2 rounded-pill mb-4"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.15)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    animation: 'fadeInUp 0.8s ease-out'
                                }}
                            >
                                <i className="fa fa-envelope me-2 text-white"></i>
                                <small className="text-white fw-medium">Newsletter</small>
                            </div>
                            
                            {/* Heading */}
                            <h2 
                                className="display-5 fw-bold mb-4"
                                style={{
                                    background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                    animation: 'fadeInUp 0.8s ease-out 0.2s both'
                                }}
                            >
                                Join Our Beauty Community
                            </h2>
                            
                            {/* Description */}
                            <p 
                                className="lead mb-4"
                                style={{
                                    color: 'rgba(255, 255, 255, 0.9)',
                                    lineHeight: '1.6',
                                    animation: 'fadeInUp 0.8s ease-out 0.4s both'
                                }}
                            >
                                Get exclusive access to beauty tips, product launches, and special offers. 
                                Join thousands of satisfied customers on their beauty journey.
                            </p>
                            
                            {/* Email Form */}
                            <div 
                                className="d-flex flex-column flex-sm-row gap-3"
                                style={{
                                    animation: 'fadeInUp 0.8s ease-out 0.6s both'
                                }}
                            >
                                <div className="flex-grow-1">
                                    <input 
                                        type="email" 
                                        placeholder="Enter your email address" 
                                        className="form-control form-control-lg"
                                        style={{
                                            borderRadius: '16px',
                                            border: 'none',
                                            padding: '16px 20px',
                                            fontSize: '1rem',
                                            background: 'rgba(255, 255, 255, 0.95)',
                                            backdropFilter: 'blur(10px)',
                                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.transform = 'translateY(-2px)'
                                            e.target.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.15)'
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.transform = 'translateY(0)'
                                            e.target.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)'
                                        }}
                                    />
                                </div>
                                <button 
                                    className="btn btn-light btn-lg px-4 fw-semibold"
                                    style={{
                                        borderRadius: '16px',
                                        border: 'none',
                                        padding: '16px 32px',
                                        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                        color: '#059669',
                                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                                        transition: 'all 0.3s ease',
                                        minWidth: '140px'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.transform = 'translateY(-3px)'
                                        e.target.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.2)'
                                        e.target.style.background = 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)'
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.transform = 'translateY(0)'
                                        e.target.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)'
                                        e.target.style.background = 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
                                    }}
                                    onClick={(e) => handleGuestRedirection(e, '/loginregister')}
                                >
                                    Subscribe
                                    <i className="fa fa-paper-plane ms-2"></i>
                                </button>
                            </div>
                            
                            {/* Trust Indicators */}
                            <div 
                                className="d-flex align-items-center gap-4 mt-4"
                                style={{
                                    animation: 'fadeInUp 0.8s ease-out 0.8s both'
                                }}
                            >
                                <div className="d-flex align-items-center">
                                    <i className="fa fa-shield-alt me-2 text-white-50"></i>
                                    <small className="text-white-50">No spam, unsubscribe anytime</small>
                                </div>
                                <div className="d-flex align-items-center">
                                    <i className="fa fa-users me-2 text-white-50"></i>
                                    <small className="text-white-50">Join 10,000+ subscribers</small>
                                </div>
                            </div>
                        </div>
                        
                        <div className="col-md-6 d-none d-md-block">
                            <div 
                                className="position-relative"
                                style={{
                                    animation: 'fadeInRight 1s ease-out 0.4s both'
                                }}
                            >
                                {/* Floating Elements */}
                                <div 
                                    className="position-absolute"
                                    style={{
                                        top: '10%',
                                        right: '10%',
                                        width: '60px',
                                        height: '60px',
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        borderRadius: '50%',
                                        backdropFilter: 'blur(10px)',
                                        animation: 'float 3s ease-in-out infinite'
                                    }}
                                ></div>
                                <div 
                                    className="position-absolute"
                                    style={{
                                        bottom: '20%',
                                        left: '5%',
                                        width: '40px',
                                        height: '40px',
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        borderRadius: '50%',
                                        backdropFilter: 'blur(10px)',
                                        animation: 'float 3s ease-in-out infinite 1.5s'
                                    }}
                                ></div>
                                
                                <img 
                                    src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=400&fit=crop" 
                                    alt="Beauty products newsletter" 
                                    className="img-fluid rounded-4"
                                    style={{
                                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                                        transform: 'perspective(1000px) rotateY(-5deg) rotateX(5deg)',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) scale(1.02)'
                                        e.target.style.boxShadow = '0 25px 80px rgba(0, 0, 0, 0.4)'
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.transform = 'perspective(1000px) rotateY(-5deg) rotateX(5deg) scale(1)'
                                        e.target.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.3)'
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default Home