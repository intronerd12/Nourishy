import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Form, Badge, Alert, Modal } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import MetaData from '../Components/Layout/MetaData'
import Loader from '../Components/Layout/Loader'
import { toast } from 'react-toastify'
import '../styles/Order.css'
import { useAuth } from '../contexts/AuthContext'

const OrderCart = ({ addItemToCart, cartItems, removeItemFromCart, saveShippingInfo }) => {
    const [products, setProducts] = useState([])
    const [selectedProducts, setSelectedProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [currentStep, setCurrentStep] = useState(1)
    const [orderSummary, setOrderSummary] = useState({})
    const [showConfirmation, setShowConfirmation] = useState(false)
    const navigate = useNavigate()
    const { user, isAuthenticated } = useAuth()
    
    // Form states
    const [customerInfo, setCustomerInfo] = useState({
        name: '',
        email: '',
        phone: ''
    })
    
    const [deliveryInfo, setDeliveryInfo] = useState({
        address: '',
        city: '',
        postalCode: '',
        deliveryDate: '',
        deliveryTime: 'morning'
    })
    
    const [paymentMethod, setPaymentMethod] = useState('cod')
    const [specialInstructions, setSpecialInstructions] = useState('')

    // Customization options
    const customizationOptions = {
        'Shampoo': ['250ml', '500ml', '1L'],
        'Conditioner': ['250ml', '500ml', '1L'],
        'Hair Oil': ['50ml', '100ml', '200ml'],
        'Hair Mask': ['200ml', '400ml', '600ml'],
        'Hair Serum': ['30ml', '60ml', '100ml'],
        'Hair Spray': ['150ml', '300ml', '500ml']
    }

    // Fallback images for products
    const fallbackImages = {
        'Shampoo': 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&h=400&fit=crop',
        'Conditioner': 'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=400&h=400&fit=crop',
        'Hair Oil': 'https://images.unsplash.com/photo-1570554886111-e80fcca6a029?w=400&h=400&fit=crop',
        'Hair Mask': 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop',
        'Hair Serum': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop',
        'Hair Spray': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=400&fit=crop'
    }

    // Fetch products from API
    const fetchProducts = async () => {
        try {
            setLoading(true)
            const { data } = await axios.get(`${import.meta.env.VITE_API}/products`)
            setProducts(data.products || [])
            setLoading(false)
        } catch (error) {
            console.error('Error fetching products:', error)
            toast.error('Failed to load products')
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProducts()
    }, [])

    // Prefill authenticated user's name and email, keep email read-only
    useEffect(() => {
        if (isAuthenticated && user) {
            setCustomerInfo(prev => ({
                ...prev,
                name: user.name || prev.name,
                email: user.email || prev.email
            }))
        }
    }, [isAuthenticated, user])

    // Get product image with fallback
    const getProductImage = (product) => {
        if (product.images && product.images.length > 0) {
            return product.images[0].url
        }
        return fallbackImages[product.category] || fallbackImages['Shampoo']
    }

    // Add product to order
    const addToOrder = (product, customization = {}) => {
        const orderItem = {
            ...product,
            quantity: customization.quantity || 1,
            size: customization.size || customizationOptions[product.category]?.[0] || 'Standard',
            customPrice: calculateCustomPrice(product.price, customization.size)
        }

        setSelectedProducts(prev => {
            const existingIndex = prev.findIndex(item => 
                item._id === product._id && item.size === orderItem.size
            )
            
            if (existingIndex >= 0) {
                const updated = [...prev]
                updated[existingIndex].quantity += orderItem.quantity
                return updated
            } else {
                return [...prev, orderItem]
            }
        })

        toast.success(`${product.name} added to order!`, {
            position: 'bottom-right'
        })
    }

    // Calculate custom price based on size
    const calculateCustomPrice = (basePrice, size) => {
        const sizeMultipliers = {
            '50ml': 0.7, '100ml': 1, '150ml': 1.2, '200ml': 1.4, '250ml': 1.5,
            '300ml': 1.8, '400ml': 2.2, '500ml': 2.5, '600ml': 3, '1L': 4
        }
        return Math.round(basePrice * (sizeMultipliers[size] || 1))
    }

    // Remove product from cart
    const removeFromCart = (productId) => {
        removeItemFromCart(productId)
        toast.success('Item removed from cart', {
            position: 'bottom-right'
        })
    }

    // Update quantity in cart
    const updateCartQuantity = (product, newQuantity) => {
        if (newQuantity <= 0) {
            removeFromCart(product.product)
            return
        }

        // Remove the item first, then add it back with new quantity
        removeItemFromCart(product.product)
        for (let i = 0; i < newQuantity; i++) {
            addItemToCart(product.product, 1)
        }
    }

    // Calculate totals
    const calculateTotals = () => {
        const subtotal = cartItems.reduce((sum, item) => 
            sum + (item.price * item.quantity), 0
        )
        const shipping = 0
        const tax = 0
        const total = subtotal

        return { subtotal, shipping, tax, total }
    }

    // Progress steps
    const steps = [
        { number: 1, title: 'Cart', icon: '🛒' },
        { number: 2, title: 'Customer Info', icon: '👤' },
        { number: 3, title: 'Delivery Details', icon: '🚚' },
        { number: 4, title: 'Payment', icon: '💳' }
    ]

    // Handle form submissions
    const handleCustomerInfoSubmit = (e) => {
        e.preventDefault()
        if (customerInfo.name && customerInfo.email && customerInfo.phone) {
            setCurrentStep(3)
        } else {
            toast.error('Please fill in all customer information fields')
        }
    }

    const handleDeliveryInfoSubmit = (e) => {
        e.preventDefault()
        if (deliveryInfo.address && deliveryInfo.city && deliveryInfo.postalCode) {
            setCurrentStep(4)
        } else {
            toast.error('Please fill in all delivery information fields')
        }
    }

    const handleFinalSubmit = (e) => {
        e.preventDefault()
        const totals = calculateTotals()
        
        // Save shipping info using the prop function
        if (saveShippingInfo) {
            saveShippingInfo({
                address: deliveryInfo.address,
                city: deliveryInfo.city,
                postalCode: deliveryInfo.postalCode,
                phoneNo: customerInfo.phone
            })
        }
        
        setOrderSummary({
            products: cartItems,
            customer: customerInfo,
            delivery: deliveryInfo,
            payment: paymentMethod,
            instructions: specialInstructions,
            totals
        })
        setShowConfirmation(true)
    }

    const confirmOrder = async () => {
        try {
            if (!isAuthenticated) {
                toast.error('Please login to place an order')
                return
            }

            if (!cartItems || cartItems.length === 0) {
                toast.error('Your cart is empty')
                return
            }

            const totals = calculateTotals()
            const payload = {
                orderItems: cartItems.map(i => ({ product: i.product, quantity: i.quantity })),
                shippingInfo: {
                    address: deliveryInfo.address,
                    city: deliveryInfo.city,
                    postalCode: deliveryInfo.postalCode,
                    country: 'Philippines',
                    phoneNo: customerInfo.phone
                },
                taxPrice: totals.tax,
                shippingPrice: totals.shipping,
                paymentInfo: { id: paymentMethod, status: paymentMethod }
            }

            const { data } = await axios.post('/order/new', payload)
            if (data?.success) {
                // Clear cart items one by one so App state persists and localStorage syncs
                for (const item of cartItems) {
                    removeItemFromCart(item.product)
                }

                toast.success('Order placed successfully!', { position: 'top-center' })
                setShowConfirmation(false)
                navigate('/orders')
            } else {
                toast.error('Failed to place order')
            }
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to place order'
            toast.error(message)
        }
    }

    if (loading) {
        return <Loader />
    }

    return (
        <>
            <MetaData title="Place Your Order | Nourishy Hair Products" />
            
            {/* Hero Section */}
            <div className="order-hero">
                <Container>
                    <Row className="align-items-center py-5">
                        <Col lg={8}>
                            <h1 className="display-4 fw-bold text-white mb-3">
                                Create Your Perfect Hair Care Order
                            </h1>
                            <p className="lead text-white-50 mb-4">
                                Customize your hair care routine with our premium products. 
                                Free shipping on orders over ₱2,500!
                            </p>
                        </Col>
                        <Col lg={4} className="text-center">
                            <div className="order-hero-icon">
                                <i className="fas fa-shopping-bag fa-5x text-white opacity-75"></i>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>

            {/* Progress Indicator */}
            <div className="progress-section bg-light py-4">
                <Container>
                    <div className="progress-steps">
                        {steps.map((step, index) => (
                            <div 
                                key={step.number}
                                className={`progress-step ${currentStep >= step.number ? 'active' : ''} ${currentStep > step.number ? 'completed' : ''}`}
                            >
                                <div className="step-icon">
                                    {currentStep > step.number ? (
                                        <i className="fas fa-check"></i>
                                    ) : (
                                        <span>{step.icon}</span>
                                    )}
                                </div>
                                <div className="step-content">
                                    <div className="step-number">Step {step.number}</div>
                                    <div className="step-title">{step.title}</div>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={`step-connector ${currentStep > step.number ? 'completed' : ''}`}></div>
                                )}
                            </div>
                        ))}
                    </div>
                </Container>
            </div>

            <Container className="py-5">
                <Row>
                    {/* Main Content */}
                    <Col lg={8}>
                        {/* Step 1: Cart */}
                        {currentStep === 1 && (
                            <div className="order-step">
                                <div className="step-header">
                                    <h2 className="h3 mb-3">
                                        <span className="step-badge">1</span>
                                        Your Cart
                                    </h2>
                                    <p className="text-muted">Modify your selected items</p>
                                </div>

                                {cartItems.length === 0 ? (
                                    <div className="empty-cart text-center py-5">
                                        <i className="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
                                        <h4>Your cart is empty</h4>
                                        <p className="text-muted">Add some products to your cart to continue</p>
                                        <Link to="/shop" className="btn btn-primary">
                                            <i className="fas fa-shopping-bag me-2"></i>
                                            Continue Shopping
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="cart-items">
                                        {cartItems.map(item => (
                                            <Card key={`${item.product}-${item.name}`} className="mb-3">
                                                <Card.Body>
                                                    <Row className="align-items-center">
                                                        <Col md={2}>
                                                            <img 
                                                                src={item.image || '/images/default-product.jpg'} 
                                                                alt={item.name}
                                                                className="img-fluid rounded"
                                                                style={{maxHeight: '80px'}}
                                                            />
                                                        </Col>
                                                        <Col md={4}>
                                                            <h6 className="mb-1">{item.name}</h6>
                                                            <small className="text-muted">₱{item.price}</small>
                                                        </Col>
                                                        <Col md={3}>
                                                            <div className="quantity-controls d-flex align-items-center">
                                                                <Button 
                                                                    variant="outline-secondary" 
                                                                    size="sm"
                                                                    onClick={() => updateCartQuantity(item, item.quantity - 1)}
                                                                >
                                                                    -
                                                                </Button>
                                                                <span className="mx-3">{item.quantity}</span>
                                                                <Button 
                                                                    variant="outline-secondary" 
                                                                    size="sm"
                                                                    onClick={() => updateCartQuantity(item, item.quantity + 1)}
                                                                >
                                                                    +
                                                                </Button>
                                                            </div>
                                                        </Col>
                                                        <Col md={2}>
                                                            <strong>₱{(item.price * item.quantity).toFixed(2)}</strong>
                                                        </Col>
                                                        <Col md={1}>
                                                            <Button 
                                                                variant="outline-danger" 
                                                                size="sm"
                                                                onClick={() => removeFromCart(item.product)}
                                                            >
                                                                <i className="fas fa-trash"></i>
                                                            </Button>
                                                        </Col>
                                                    </Row>
                                                </Card.Body>
                                            </Card>
                                        ))}
                                    </div>
                                )}

                                {cartItems.length > 0 && (
                                    <div className="text-center mt-4">
                                        <Button 
                                            variant="primary" 
                                            size="lg"
                                            onClick={() => setCurrentStep(2)}
                                            className="order-cta-btn"
                                        >
                                            Continue to Customer Info
                                            <i className="fas fa-arrow-right ms-2"></i>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 2: Customer Information */}
                        {currentStep === 2 && (
                            <div className="order-step">
                                <div className="step-header">
                                    <h2 className="h3 mb-3">
                                        <span className="step-badge">2</span>
                                        Customer Information
                                    </h2>
                                    <p className="text-muted">Tell us how to reach you</p>
                                </div>

                                <Card className="border-0 shadow-sm">
                                    <Card.Body className="p-4">
                                        <Form onSubmit={handleCustomerInfoSubmit}>
                                            <Row>
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Full Name *</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            value={customerInfo.name}
                                                            onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                                                            required
                                                            className="form-control-lg"
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Email Address *</Form.Label>
                                                            <Form.Control
                                                                type="email"
                                                                value={customerInfo.email}
                                                                readOnly
                                                                required
                                                                className="form-control-lg"
                                                                title="Your email is set from your account and cannot be edited here"
                                                            />
                                                        </Form.Group>
                                                </Col>
                                            </Row>
                                            <Form.Group className="mb-4">
                                                <Form.Label>Phone Number *</Form.Label>
                                                <Form.Control
                                                    type="tel"
                                                    value={customerInfo.phone}
                                                    onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                                                    required
                                                    className="form-control-lg"
                                                    placeholder="+63 XXX XXX XXXX"
                                                />
                                            </Form.Group>
                                            <div className="d-flex justify-content-between">
                                                <Button 
                                                    variant="outline-secondary"
                                                    onClick={() => setCurrentStep(1)}
                                                >
                                                    <i className="fas fa-arrow-left me-2"></i>
                                                    Back to Products
                                                </Button>
                                                <Button 
                                                    type="submit"
                                                    variant="primary"
                                                    size="lg"
                                                    className="order-cta-btn"
                                                >
                                                    Continue to Delivery
                                                    <i className="fas fa-arrow-right ms-2"></i>
                                                </Button>
                                            </div>
                                        </Form>
                                    </Card.Body>
                                </Card>
                            </div>
                        )}

                        {/* Step 3: Delivery Information */}
                        {currentStep === 3 && (
                            <div className="order-step">
                                <div className="step-header">
                                    <h2 className="h3 mb-3">
                                        <span className="step-badge">3</span>
                                        Delivery Information
                                    </h2>
                                    <p className="text-muted">Where should we deliver your order?</p>
                                </div>

                                <Card className="border-0 shadow-sm">
                                    <Card.Body className="p-4">
                                        <Form onSubmit={handleDeliveryInfoSubmit}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Delivery Address *</Form.Label>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={3}
                                                    value={deliveryInfo.address}
                                                    onChange={(e) => setDeliveryInfo({...deliveryInfo, address: e.target.value})}
                                                    required
                                                    className="form-control-lg"
                                                    placeholder="Street address, building, apartment number"
                                                />
                                            </Form.Group>
                                            <Row>
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>City *</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            value={deliveryInfo.city}
                                                            onChange={(e) => setDeliveryInfo({...deliveryInfo, city: e.target.value})}
                                                            required
                                                            className="form-control-lg"
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Postal Code *</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            value={deliveryInfo.postalCode}
                                                            onChange={(e) => setDeliveryInfo({...deliveryInfo, postalCode: e.target.value})}
                                                            required
                                                            className="form-control-lg"
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Preferred Delivery Date</Form.Label>
                                                        <Form.Control
                                                            type="date"
                                                            value={deliveryInfo.deliveryDate}
                                                            onChange={(e) => setDeliveryInfo({...deliveryInfo, deliveryDate: e.target.value})}
                                                            className="form-control-lg"
                                                            min={new Date().toISOString().split('T')[0]}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group className="mb-4">
                                                        <Form.Label>Delivery Time</Form.Label>
                                                        <Form.Select
                                                            value={deliveryInfo.deliveryTime}
                                                            onChange={(e) => setDeliveryInfo({...deliveryInfo, deliveryTime: e.target.value})}
                                                            className="form-control-lg"
                                                        >
                                                            <option value="morning">Morning (9AM - 12PM)</option>
                                                            <option value="afternoon">Afternoon (1PM - 5PM)</option>
                                                            <option value="evening">Evening (6PM - 8PM)</option>
                                                        </Form.Select>
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                            <div className="d-flex justify-content-between">
                                                <Button 
                                                    variant="outline-secondary"
                                                    onClick={() => setCurrentStep(2)}
                                                >
                                                    <i className="fas fa-arrow-left me-2"></i>
                                                    Back to Customer Info
                                                </Button>
                                                <Button 
                                                    type="submit"
                                                    variant="primary"
                                                    size="lg"
                                                    className="order-cta-btn"
                                                >
                                                    Continue to Payment
                                                    <i className="fas fa-arrow-right ms-2"></i>
                                                </Button>
                                            </div>
                                        </Form>
                                    </Card.Body>
                                </Card>
                            </div>
                        )}

                        {/* Step 4: Payment */}
                        {currentStep === 4 && (
                            <div className="order-step">
                                <div className="step-header">
                                    <h2 className="h3 mb-3">
                                        <span className="step-badge">4</span>
                                        Payment
                                    </h2>
                                    <p className="text-muted">Choose your payment method</p>
                                </div>

                                <Card className="border-0 shadow-sm mb-4">
                                    <Card.Body className="p-4">
                                        <h5 className="mb-3">Payment Method</h5>
                                        <Form onSubmit={handleFinalSubmit}>
                                            <div className="payment-methods mb-4">
                                                <div className="payment-method-option">
                                                    <Form.Check
                                                        type="radio"
                                                        id="cod"
                                                        name="paymentMethod"
                                                        value="cod"
                                                        checked={paymentMethod === 'cod'}
                                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                                        label={
                                                            <div className="d-flex align-items-center">
                                                                <i className="fas fa-money-bill-wave me-3 text-primary"></i>
                                                                Cash on Delivery
                                                            </div>
                                                        }
                                                    />
                                                    <small className="text-muted ms-4">Pay when your order is delivered to your doorstep</small>
                                                </div>
                                            </div>

                                            <Form.Group className="mb-4">
                                                <Form.Label>Special Instructions (Optional)</Form.Label>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={3}
                                                    value={specialInstructions}
                                                    onChange={(e) => setSpecialInstructions(e.target.value)}
                                                    placeholder="Any special requests or delivery instructions..."
                                                    className="form-control-lg"
                                                />
                                            </Form.Group>

                                            <div className="d-flex justify-content-between">
                                                <Button 
                                                    variant="outline-secondary"
                                                    onClick={() => setCurrentStep(3)}
                                                >
                                                    <i className="fas fa-arrow-left me-2"></i>
                                                    Back to Delivery
                                                </Button>
                                                <Button 
                                                    type="submit"
                                                    variant="success"
                                                    size="lg"
                                                    className="order-final-btn"
                                                >
                                                    <i className="fas fa-check me-2"></i>
                                                    Place Order
                                                </Button>
                                            </div>
                                        </Form>
                                    </Card.Body>
                                </Card>
                            </div>
                        )}
                    </Col>

                    {/* Order Summary Sidebar */}
                    <Col lg={4}>
                        <div className="order-summary-sticky">
                            <Card className="border-0 shadow-sm">
                                <Card.Header className="bg-primary text-white">
                                    <h5 className="mb-0">
                                        <i className="fas fa-shopping-cart me-2"></i>
                                        Order Summary
                                    </h5>
                                </Card.Header>
                                <Card.Body className="p-0">
                                    {selectedProducts.length === 0 ? (
                                        <div className="text-center p-4 text-muted">
                                            <i className="fas fa-shopping-cart fa-3x mb-3 opacity-50"></i>
                                            <p>No products selected yet</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="order-items">
                                                {selectedProducts.map((item, index) => (
                                                    <OrderSummaryItem 
                                                        key={`${item._id}-${item.size}`}
                                                        item={item}
                                                        updateQuantity={updateQuantity}
                                                        removeFromOrder={removeFromOrder}
                                                        getProductImage={getProductImage}
                                                    />
                                                ))}
                                            </div>
                                            <OrderTotals totals={calculateTotals()} />
                                        </>
                                    )}
                                </Card.Body>
                            </Card>

                            {/* Trust Badges */}
                            <div className="trust-badges mt-4">
                                <div className="trust-badge">
                                    <i className="fas fa-shield-alt text-success"></i>
                                    <span>Secure Payment</span>
                                </div>
                                <div className="trust-badge">
                                    <i className="fas fa-truck text-primary"></i>
                                    <span>Fast Delivery</span>
                                </div>
                                <div className="trust-badge">
                                    <i className="fas fa-undo text-info"></i>
                                    <span>30-Day Returns</span>
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>

            {/* Order Confirmation Modal */}
            <OrderConfirmationModal 
                show={showConfirmation}
                onHide={() => setShowConfirmation(false)}
                orderSummary={orderSummary}
                confirmOrder={confirmOrder}
            />
        </>
    )
}

// Product Card Component
const ProductCard = ({ product, getProductImage, customizationOptions, addToOrder }) => {
    const [selectedSize, setSelectedSize] = useState('')
    const [quantity, setQuantity] = useState(1)

    useEffect(() => {
        if (customizationOptions[product.category]) {
            setSelectedSize(customizationOptions[product.category][0])
        }
    }, [product.category, customizationOptions])

    const handleAddToOrder = () => {
        addToOrder(product, { size: selectedSize, quantity })
        setQuantity(1)
    }

    const calculatePrice = (basePrice, size) => {
        const sizeMultipliers = {
            '50ml': 0.7, '100ml': 1, '150ml': 1.2, '200ml': 1.4, '250ml': 1.5,
            '300ml': 1.8, '400ml': 2.2, '500ml': 2.5, '600ml': 3, '1L': 4
        }
        return Math.round(basePrice * (sizeMultipliers[size] || 1))
    }

    return (
        <Card className="product-card h-100 border-0 shadow-sm">
            <div className="product-image-container">
                <Card.Img 
                    variant="top" 
                    src={getProductImage(product)} 
                    alt={product.name}
                    className="product-image"
                />
                <Badge bg="primary" className="product-category-badge">
                    {product.category}
                </Badge>
            </div>
            <Card.Body className="d-flex flex-column">
                <Card.Title className="h6 mb-2">{product.name}</Card.Title>
                <Card.Text className="text-muted small mb-3 flex-grow-1">
                    {product.description?.substring(0, 80)}...
                </Card.Text>
                
                {/* Customization Options */}
                {customizationOptions[product.category] && (
                    <Form.Group className="mb-3">
                        <Form.Label className="small fw-semibold">Size:</Form.Label>
                        <Form.Select 
                            size="sm"
                            value={selectedSize}
                            onChange={(e) => setSelectedSize(e.target.value)}
                        >
                            {customizationOptions[product.category].map(size => (
                                <option key={size} value={size}>{size}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                )}

                {/* Quantity Selector */}
                <Form.Group className="mb-3">
                    <Form.Label className="small fw-semibold">Quantity:</Form.Label>
                    <div className="quantity-selector">
                        <Button 
                            variant="outline-secondary" 
                            size="sm"
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        >
                            -
                        </Button>
                        <span className="quantity-display">{quantity}</span>
                        <Button 
                            variant="outline-secondary" 
                            size="sm"
                            onClick={() => setQuantity(quantity + 1)}
                        >
                            +
                        </Button>
                    </div>
                </Form.Group>

                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="price-display">
                        <span className="h6 text-primary mb-0">
                            ₱{calculatePrice(product.price, selectedSize).toLocaleString()}
                        </span>
                        {selectedSize && calculatePrice(product.price, selectedSize) !== product.price && (
                            <small className="text-muted d-block">
                                Base: ₱{product.price.toLocaleString()}
                            </small>
                        )}
                    </div>

                </div>

                <Button 
                    variant="primary" 
                    className="add-to-order-btn"
                    onClick={handleAddToOrder}
                >
                    <i className="fas fa-plus me-2"></i>
                    Add to Order
                </Button>
            </Card.Body>
        </Card>
    )
}

// Order Summary Item Component
const OrderSummaryItem = ({ item, updateQuantity, removeFromOrder, getProductImage }) => {
    return (
        <div className="order-summary-item">
            <div className="item-image">
                <img src={getProductImage(item)} alt={item.name} />
            </div>
            <div className="item-details">
                <h6 className="item-name">{item.name}</h6>
                <p className="item-size text-muted small">{item.size}</p>
                <div className="item-controls">
                    <div className="quantity-controls">
                        <button 
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => updateQuantity(item._id, item.size, item.quantity - 1)}
                        >
                            -
                        </button>
                        <span className="quantity">{item.quantity}</span>
                        <button 
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => updateQuantity(item._id, item.size, item.quantity + 1)}
                        >
                            +
                        </button>
                    </div>
                    <button 
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => removeFromOrder(item._id, item.size)}
                    >
                        <i className="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div className="item-price">
                <span className="price">₱{(item.customPrice * item.quantity).toLocaleString()}</span>
            </div>
        </div>
    )
}

// Order Totals Component
const OrderTotals = ({ totals }) => {
    return (
        <div className="order-totals">
            <div className="total-line">
                <span>Subtotal:</span>
                <span>₱{totals.subtotal.toLocaleString()}</span>
            </div>
            <div className="total-line">
                <span>Shipping:</span>
                <span>FREE</span>
            </div>
            <div className="total-line total-final">
                <span>Total:</span>
                <span>₱{totals.total.toLocaleString()}</span>
            </div>
        </div>
    )
}

// Order Confirmation Modal Component
const OrderConfirmationModal = ({ show, onHide, orderSummary, confirmOrder }) => {
    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton className="bg-primary text-white">
                <Modal.Title>
                    <i className="fas fa-check-circle me-2"></i>
                    Confirm Your Order
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
                {orderSummary.products && (
                    <>
                        <div className="confirmation-section mb-4">
                            <h6 className="text-primary mb-3">Order Items</h6>
                            {orderSummary.products.map((item, index) => (
                                <div key={index} className="confirmation-item">
                                    <span>{item.name} ({item.size})</span>
                                    <span>Qty: {item.quantity}</span>
                                    <span>₱{(Number((item.customPrice ?? item.price)) * Number(item.quantity)).toLocaleString()}</span>
                                </div>
                            ))}
                        </div>

                        <div className="confirmation-section mb-4">
                            <h6 className="text-primary mb-3">Customer Information</h6>
                            <p className="mb-1"><strong>Name:</strong> {orderSummary.customer?.name}</p>
                            <p className="mb-1"><strong>Email:</strong> {orderSummary.customer?.email}</p>
                            <p className="mb-1"><strong>Phone:</strong> {orderSummary.customer?.phone}</p>
                        </div>

                        <div className="confirmation-section mb-4">
                            <h6 className="text-primary mb-3">Delivery Information</h6>
                            <p className="mb-1"><strong>Address:</strong> {orderSummary.delivery?.address}</p>
                            <p className="mb-1"><strong>City:</strong> {orderSummary.delivery?.city}</p>
                            <p className="mb-1"><strong>Postal Code:</strong> {orderSummary.delivery?.postalCode}</p>
                            {orderSummary.delivery?.deliveryDate && (
                                <p className="mb-1"><strong>Delivery Date:</strong> {orderSummary.delivery.deliveryDate}</p>
                            )}
                        </div>

                        <div className="confirmation-section mb-4">
                            <h6 className="text-primary mb-3">Order Total</h6>
                            <div className="total-confirmation">
                                <div className="d-flex justify-content-between">
                                    <span>Subtotal:</span>
                                    <span>₱{orderSummary.totals?.subtotal.toLocaleString()}</span>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <span>Shipping:</span>
                                    <span>FREE</span>
                                </div>
                                <hr />
                                <div className="d-flex justify-content-between h5">
                                    <span>Total:</span>
                                    <span className="text-primary">₱{orderSummary.totals?.total.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-secondary" onClick={onHide}>
                    Cancel
                </Button>
                <Button variant="success" onClick={confirmOrder} size="lg">
                    <i className="fas fa-check me-2"></i>
                    Confirm Order
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default OrderCart