import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const Product = ({ product }) => {
    const [isWishlisted, setIsWishlisted] = useState(false)
    const [imageLoaded, setImageLoaded] = useState(false)

    // Fallback images for products
    const fallbackImages = {
        'Shampoo': 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&h=400&fit=crop',
        'Conditioner': 'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=400&h=400&fit=crop',
        'Hair Oil': 'https://images.unsplash.com/photo-1570554886111-e80fcca6a029?w=400&h=400&fit=crop',
        'Hair Mask': 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop',
        'Hair Serum': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop',
        'Hair Spray': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=400&fit=crop'
    }

    const getProductImage = () => {
        if (product.images && product.images.length > 0) {
            return product.images[0].url
        }
        return fallbackImages[product.category] || fallbackImages['Shampoo']
    }

    const handleWishlistToggle = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsWishlisted(!isWishlisted)
    }

    return (
        <div className="col-12 col-sm-6 col-lg-4 col-xl-3 mb-4">
            <div 
                className="product-card h-100 position-relative overflow-hidden"
                style={{
                    borderRadius: '20px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
                    border: '1px solid rgba(5, 150, 105, 0.1)',
                    cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-12px) scale(1.02)'
                    e.currentTarget.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.15)'
                    e.currentTarget.style.borderColor = 'rgba(5, 150, 105, 0.2)'
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)'
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.08)'
                    e.currentTarget.style.borderColor = 'rgba(5, 150, 105, 0.1)'
                }}
            >
                {/* Product Image Container */}
                <div className="position-relative overflow-hidden" style={{borderRadius: '20px 20px 0 0', height: '280px'}}>
                    {/* Loading Skeleton */}
                    {!imageLoaded && (
                        <div 
                            className="position-absolute w-100 h-100 d-flex align-items-center justify-content-center"
                            style={{
                                background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                                backgroundSize: '200px 100%',
                                animation: 'shimmer 1.5s infinite'
                            }}
                        >
                            <i className="fa fa-image text-muted" style={{fontSize: '2rem'}}></i>
                        </div>
                    )}

                    {/* Gradient Overlay */}
                    <div 
                        className="position-absolute top-0 start-0 w-100 h-100 product-overlay"
                        style={{
                            background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
                            opacity: 0,
                            transition: 'opacity 0.3s ease',
                            zIndex: 1
                        }}
                    ></div>
                    
                    {/* Category Badge */}
                    <div className="position-absolute top-0 start-0 m-3" style={{zIndex: 3}}>
                        <span 
                            className="badge px-3 py-2 fw-semibold"
                            style={{
                                background: 'linear-gradient(135deg, #059669, #10b981)',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)',
                                color: 'white'
                            }}
                        >
                            {product.category}
                        </span>
                    </div>

                    {/* Wishlist Button */}
                    <div className="position-absolute top-0 end-0 m-3" style={{zIndex: 3}}>
                        <button 
                            className="btn btn-light rounded-circle p-2 wishlist-btn"
                            style={{
                                width: '40px',
                                height: '40px',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                opacity: 0,
                                transition: 'all 0.3s ease',
                                border: 'none'
                            }}
                            onClick={handleWishlistToggle}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'scale(1.1)'
                                e.target.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.15)'
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'scale(1)'
                                e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)'
                            }}
                        >
                            <i 
                                className={`fa fa-heart ${isWishlisted ? 'text-danger' : 'text-muted'}`}
                                style={{transition: 'color 0.3s ease'}}
                            ></i>
                        </button>
                    </div>

                    {/* Stock Status */}
                    {product.stock <= 5 && product.stock > 0 && (
                        <div className="position-absolute bottom-0 start-0 m-3" style={{zIndex: 3}}>
                            <span 
                                className="badge bg-warning text-dark px-3 py-2 fw-semibold"
                                style={{
                                    borderRadius: '12px',
                                    fontSize: '0.75rem',
                                    boxShadow: '0 4px 12px rgba(255, 193, 7, 0.3)'
                                }}
                            >
                                Only {product.stock} left!
                            </span>
                        </div>
                    )}

                    {product.stock === 0 && (
                        <div className="position-absolute bottom-0 start-0 m-3" style={{zIndex: 3}}>
                            <span 
                                className="badge bg-danger px-3 py-2 fw-semibold"
                                style={{
                                    borderRadius: '12px',
                                    fontSize: '0.75rem',
                                    boxShadow: '0 4px 12px rgba(220, 53, 69, 0.3)'
                                }}
                            >
                                Out of Stock
                            </span>
                        </div>
                    )}
                    
                    <img 
                        src={getProductImage()}
                        alt={product.name} 
                        className="w-100 h-100 product-image"
                        style={{
                            objectFit: 'cover',
                            transition: 'transform 0.6s ease',
                            opacity: imageLoaded ? 1 : 0
                        }}
                        onLoad={() => setImageLoaded(true)}
                        onError={(e) => {
                            e.target.src = fallbackImages[product.category] || fallbackImages['Shampoo']
                            setImageLoaded(true)
                        }}
                    />
                </div>
                
                {/* Card Body */}
                <div className="card-body d-flex flex-column p-4" style={{minHeight: '200px'}}>
                    {/* Product Name */}
                    <h5 
                        className="card-title fw-bold mb-2"
                        style={{
                            fontSize: '1.1rem',
                            lineHeight: '1.3',
                            color: '#1f2937',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            minHeight: '2.6rem'
                        }}
                    >
                        {product.name}
                    </h5>
                    
                    {/* Description */}
                    <p 
                        className="card-text text-muted mb-3"
                        style={{
                            fontSize: '0.875rem',
                            lineHeight: '1.5',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            minHeight: '2.625rem'
                        }}
                    >
                        {product.description || 'Premium hair care product for healthy, beautiful hair.'}
                    </p>
                    
                    {/* Rating */}
                    <div className="d-flex align-items-center mb-3">
                        <div className="rating-outer me-2" style={{position: 'relative', display: 'inline-block'}}>
                            <div 
                                className="rating-inner"
                                style={{ 
                                    width: `${(product.ratings / 5) * 100}%`,
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    color: '#fbbf24'
                                }}
                            >
                                ★★★★★
                            </div>
                            <div style={{color: '#e5e7eb'}}>★★★★★</div>
                        </div>
                        <small className="text-muted fw-medium">
                            {product.ratings?.toFixed(1) || '4.5'} ({product.numOfReviews || 0})
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
                                <small className="fw-medium">
                                    {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                </small>
                            </div>
                        </div>
                        
                        <div className="d-grid gap-2">
                            <Link 
                                to={`/product/${product._id}`} 
                                className="btn btn-primary fw-semibold py-2 view-details-btn"
                                style={{
                                    background: 'linear-gradient(135deg, #059669, #10b981)',
                                    border: 'none',
                                    borderRadius: '12px',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)',
                                    textDecoration: 'none'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.transform = 'translateY(-2px)'
                                    e.target.style.boxShadow = '0 6px 20px rgba(5, 150, 105, 0.4)'
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = 'translateY(0)'
                                    e.target.style.boxShadow = '0 4px 12px rgba(5, 150, 105, 0.3)'
                                }}
                            >
                                View Details
                                <i className="fa fa-arrow-right ms-2" style={{fontSize: '0.875rem'}}></i>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Click Feedback Overlay */}
                <div 
                    className="position-absolute top-0 start-0 w-100 h-100 click-feedback"
                    style={{
                        background: 'radial-gradient(circle at center, rgba(5, 150, 105, 0.1) 0%, transparent 70%)',
                        opacity: 0,
                        transform: 'scale(0)',
                        transition: 'all 0.3s ease',
                        pointerEvents: 'none',
                        borderRadius: '20px'
                    }}
                ></div>
            </div>

            <style jsx>{`
                .product-card:hover .product-overlay {
                    opacity: 1 !important;
                }
                
                .product-card:hover .wishlist-btn {
                    opacity: 1 !important;
                }
                
                .product-card:hover .product-image {
                    transform: scale(1.1);
                }
                
                .product-card:active .click-feedback {
                    opacity: 1;
                    transform: scale(1);
                }
                
                @keyframes shimmer {
                    0% {
                        background-position: -200px 0;
                    }
                    100% {
                        background-position: calc(200px + 100%) 0;
                    }
                }
            `}</style>
        </div>
    )
}

export default Product