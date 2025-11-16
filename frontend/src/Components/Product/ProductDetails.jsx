import React, { Fragment, useEffect, useState } from 'react'
import { Carousel } from 'react-bootstrap'
import { useParams, Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import MetaData from '../Layout/MetaData'
import { useAuth } from '../../contexts/AuthContext'

const ProductDetails = ({ addItemToCart, cartItems }) => {
    const { isAuthenticated } = useAuth()
    const [product, setProduct] = useState({})
    const [error, setError] = useState('')
    const [quantity, setQuantity] = useState(1)
    const [loading, setLoading] = useState(true)
    const [isWishlisted, setIsWishlisted] = useState(false)
    const [selectedImageIndex, setSelectedImageIndex] = useState(0)
    const [addingToCart, setAddingToCart] = useState(false)

    let { id } = useParams()
    let navigate = useNavigate()

    // Fallback images for products
    const fallbackImages = {
        'Shampoo': 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&h=800&fit=crop',
        'Conditioner': 'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=800&h=800&fit=crop',
        'Hair Oil': 'https://images.unsplash.com/photo-1570554886111-e80fcca6a029?w=800&h=800&fit=crop',
        'Hair Mask': 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&h=800&fit=crop',
        'Hair Serum': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&h=800&fit=crop',
        'Hair Spray': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=800&fit=crop'
    }

    const getProductImage = (imageIndex = 0) => {
        if (product.images && product.images.length > imageIndex) {
            return product.images[imageIndex].url
        }
        return fallbackImages[product.category] || fallbackImages['Shampoo']
    }

    const increaseQty = () => {
        if (quantity >= product.stock) return;
        setQuantity(quantity + 1)
    }

    const decreaseQty = () => {
        if (quantity <= 1) return;
        setQuantity(quantity - 1)
    }

    const getProductDetails = async (id) => {
        try {
            setLoading(true)
            setError('') // Clear any previous errors
            const res = await axios.get(`/product/${id}`)
            setProduct(res.data.product)
            setLoading(false)
        } catch (err) {
            console.log(err)
            if (err.response && err.response.status === 404) {
                setError('Product not found. This product may have been removed or the link is incorrect.')
            } else {
                setError('Failed to load product details. Please try again later.')
            }
            setLoading(false)
        }
    }

    useEffect(() => {
        getProductDetails(id)
    }, [id]);

    const addToCart = async () => {
        if (!isAuthenticated) {
            navigate(`/loginregister?redirect=${encodeURIComponent(window.location.pathname)}`)
            return
        }
        
        setAddingToCart(true)
        try {
            await addItemToCart(id, quantity);
            // Show success feedback
            setTimeout(() => setAddingToCart(false), 1000)
        } catch (err) {
            setAddingToCart(false)
        }
    }

    const handleWishlistToggle = () => {
        setIsWishlisted(!isWishlisted)
    }

    const renderStars = (rating) => {
        const stars = []
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <i 
                    key={i}
                    className={`fas fa-star ${i <= rating ? 'text-warning' : 'text-muted'}`}
                    style={{ fontSize: '1.2rem', marginRight: '0.2rem' }}
                />
            )
        }
        return stars
    }

    localStorage.setItem('cartItems', JSON.stringify(cartItems))

    if (loading) {
        return (
            <div className="container-fluid py-5">
                <div className="row justify-content-center">
                    <div className="col-12 text-center">
                        <div className="spinner-border text-primary" role="status">
                            <span className="sr-only">Loading...</span>
                        </div>
                        <p className="mt-3 text-muted">Loading product details...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="container-fluid py-5" style={{ minHeight: '60vh' }}>
                <div className="row justify-content-center align-items-center h-100">
                    <div className="col-12 col-md-8 col-lg-6 text-center">
                        <div className="card border-0 shadow-lg" style={{ borderRadius: '20px' }}>
                            <div className="card-body p-5">
                                <div className="mb-4">
                                    <i className="fas fa-exclamation-triangle text-warning" style={{ fontSize: '4rem' }}></i>
                                </div>
                                <h2 className="text-dark mb-3">Product Not Found</h2>
                                <p className="text-muted mb-4 lead">{error}</p>
                                <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
                                    <Link 
                                        to="/shop" 
                                        className="btn btn-primary px-4 py-2"
                                        style={{
                                            background: 'linear-gradient(135deg, #059669, #10b981)',
                                            border: 'none',
                                            borderRadius: '12px',
                                            fontWeight: '600'
                                        }}
                                    >
                                        <i className="fas fa-shopping-bag me-2"></i>
                                        Browse Products
                                    </Link>
                                    <Link 
                                        to="/" 
                                        className="btn btn-outline-secondary px-4 py-2"
                                        style={{ borderRadius: '12px', fontWeight: '600' }}
                                    >
                                        <i className="fas fa-home me-2"></i>
                                        Go Home
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
    return (
        <>
            <MetaData title={product.name} />
            
            {/* Breadcrumb Navigation */}
            <div className="container-fluid bg-light py-3">
                <div className="container">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb mb-0">
                            <li className="breadcrumb-item">
                                <Link to="/" className="text-decoration-none">Home</Link>
                            </li>
                            <li className="breadcrumb-item">
                                <Link to="/search" className="text-decoration-none">Shop</Link>
                            </li>
                            <li className="breadcrumb-item active" aria-current="page">
                                {product.name}
                            </li>
                        </ol>
                    </nav>
                </div>
            </div>

            <div className="container-fluid py-5" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%)' }}>
                <div className="container">
                    <div className="row g-5">
                        {/* Product Images */}
                        <div className="col-12 col-lg-6">
                            <div className="position-sticky" style={{ top: '2rem' }}>
                                {/* Main Image */}
                                <div 
                                    className="product-image-container mb-4"
                                    style={{
                                        borderRadius: '20px',
                                        overflow: 'hidden',
                                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
                                        background: 'white',
                                        aspectRatio: '1',
                                        position: 'relative'
                                    }}
                                >
                                    <img 
                                        src={getProductImage(selectedImageIndex)}
                                        alt={product.name}
                                        className="w-100 h-100"
                                        style={{ 
                                            objectFit: 'cover',
                                            transition: 'all 0.4s ease'
                                        }}
                                    />
                                    
                                    {/* Wishlist Button */}
                                    <button
                                        className="wishlist-btn"
                                        onClick={handleWishlistToggle}
                                        style={{
                                            position: 'absolute',
                                            top: '1rem',
                                            right: '1rem',
                                            background: isWishlisted ? 'var(--primary)' : 'rgba(255, 255, 255, 0.9)',
                                            color: isWishlisted ? 'white' : '#6b7280',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '50px',
                                            height: '50px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.3s ease',
                                            backdropFilter: 'blur(10px)',
                                            fontSize: '1.2rem'
                                        }}
                                    >
                                        <i className={`fas fa-heart`}></i>
                                    </button>
                                </div>

                                {/* Thumbnail Images */}
                                {product.images && product.images.length > 1 && (
                                    <div className="d-flex gap-3 overflow-auto">
                                        {product.images.map((image, index) => (
                                            <div
                                                key={image.public_id}
                                                className={`flex-shrink-0 cursor-pointer ${selectedImageIndex === index ? 'border-primary' : ''}`}
                                                style={{
                                                    width: '80px',
                                                    height: '80px',
                                                    borderRadius: '12px',
                                                    overflow: 'hidden',
                                                    border: selectedImageIndex === index ? '3px solid var(--primary)' : '2px solid #e5e7eb',
                                                    transition: 'all 0.3s ease'
                                                }}
                                                onClick={() => setSelectedImageIndex(index)}
                                            >
                                                <img 
                                                    src={image.url}
                                                    alt={`${product.name} ${index + 1}`}
                                                    className="w-100 h-100"
                                                    style={{ objectFit: 'cover' }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Product Information */}
                        <div className="col-12 col-lg-6">
                            <div className="bg-white p-4 p-md-5 rounded-4 shadow-lg">
                                {/* Category Badge */}
                                <span 
                                    className="badge mb-3"
                                    style={{
                                        background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                                        color: 'white',
                                        fontSize: '0.875rem',
                                        padding: '0.5rem 1rem',
                                        borderRadius: '20px',
                                        fontWeight: '600',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em'
                                    }}
                                >
                                    {product.category}
                                </span>

                                {/* Product Name */}
                                <h1 className="display-5 fw-bold text-dark mb-3" style={{ lineHeight: '1.2' }}>
                                    {product.name}
                                </h1>

                                {/* Product ID */}
                                <p className="text-muted mb-4" style={{ fontSize: '0.875rem' }}>
                                    Product ID: {product._id}
                                </p>

                                {/* Rating */}
                                <div className="d-flex align-items-center mb-4">
                                    <div className="me-3">
                                        {renderStars(Math.round(product.ratings || 0))}
                                    </div>
                                    <span className="text-muted">
                                        ({product.numOfReviews || 0} reviews)
                                    </span>
                                </div>

                                {/* Price */}
                                <div className="mb-4">
                                    <span 
                                        className="display-6 fw-bold"
                                        style={{ color: 'var(--primary)' }}
                                    >
                                        ₱{product.price}
                                    </span>
                                </div>

                                {/* Stock Status */}
                                <div className="mb-4">
                                    <div className="d-flex align-items-center">
                                        <div 
                                            className="rounded-circle me-2"
                                            style={{
                                                width: '12px',
                                                height: '12px',
                                                background: product.stock > 0 ? '#10b981' : '#ef4444'
                                            }}
                                        ></div>
                                        <span 
                                            className="fw-semibold"
                                            style={{ 
                                                color: product.stock > 0 ? '#10b981' : '#ef4444',
                                                fontSize: '1rem'
                                            }}
                                        >
                                            {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
                                        </span>
                                    </div>
                                </div>

                                {/* Quantity Selector */}
                                <div className="mb-4">
                                    <label className="form-label fw-semibold mb-3">Quantity</label>
                                    <div className="d-flex align-items-center">
                                        <div 
                                            className="d-flex align-items-center border rounded-3 overflow-hidden"
                                            style={{ background: '#f8fafc' }}
                                        >
                                            <button
                                                className="btn btn-outline-none border-0 px-3 py-2"
                                                onClick={decreaseQty}
                                                disabled={quantity <= 1}
                                                style={{
                                                    background: 'transparent',
                                                    color: 'var(--primary)',
                                                    fontSize: '1.2rem',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                −
                                            </button>
                                            <span 
                                                className="px-4 py-2 border-start border-end"
                                                style={{ 
                                                    minWidth: '60px',
                                                    textAlign: 'center',
                                                    background: 'white',
                                                    fontWeight: '600'
                                                }}
                                            >
                                                {quantity}
                                            </span>
                                            <button
                                                className="btn btn-outline-none border-0 px-3 py-2"
                                                onClick={increaseQty}
                                                disabled={quantity >= product.stock}
                                                style={{
                                                    background: 'transparent',
                                                    color: 'var(--primary)',
                                                    fontSize: '1.2rem',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Add to Cart Button */}
                                <div className="mb-5">
                                    <button
                                        className="btn btn-primary btn-lg w-100 py-3 fw-semibold"
                                        onClick={addToCart}
                                        disabled={product.stock === 0 || addingToCart}
                                        style={{
                                            borderRadius: '12px',
                                            fontSize: '1.1rem',
                                            transition: 'all 0.3s ease',
                                            background: addingToCart ? '#6b7280' : 'var(--primary)',
                                            border: 'none'
                                        }}
                                    >
                                        {addingToCart ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                Adding to Cart...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-shopping-cart me-2"></i>
                                                Add to Cart
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Product Description */}
                                <div className="mb-4">
                                    <h5 className="fw-bold mb-3">Description</h5>
                                    <p className="text-muted lh-lg" style={{ fontSize: '1rem' }}>
                                        {product.description}
                                    </p>
                                </div>

                                {/* Seller Information */}
                                {product.seller && (
                                    <div className="mb-4 p-3 rounded-3" style={{ background: '#f8fafc' }}>
                                        <small className="text-muted">Sold by</small>
                                        <div className="fw-semibold">{product.seller}</div>
                                    </div>
                                )}


                            </div>
                        </div>
                    </div>
                </div>
            </div>


        </>
    )
}

export default ProductDetails