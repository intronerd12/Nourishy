import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Badge, Alert, Modal, Table } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import axios from 'axios'
import MetaData from '../Components/Layout/MetaData'
import Loader from '../Components/Layout/Loader'
import { toast } from 'react-toastify'
import { useAuth } from '../contexts/AuthContext'
import '../styles/Orders.css'

const Orders = () => {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [showCancelModal, setShowCancelModal] = useState(false)
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [cancelReason, setCancelReason] = useState('')
    const [showReviewModal, setShowReviewModal] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [rating, setRating] = useState(0)
    const [comment, setComment] = useState('')
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [deleteOrderId, setDeleteOrderId] = useState(null)

    const { loading: authLoading, isAuthenticated, user } = useAuth()

    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            fetchOrders()
        }
    }, [authLoading, isAuthenticated])

    const fetchOrders = async () => {
        try {
            setLoading(true)
            setError('')
            
            const { data } = await axios.get(`/orders/me`)
            
            if (data.success) {
                // Map backend data structure to frontend expectations
                const mappedOrders = data.orders.map(order => ({
                    _id: order._id,
                    orderNumber: order._id.slice(-8).toUpperCase(), // Use last 8 chars of ID as order number
                    orderDate: order.createdAt,
                    status: order.orderStatus.toLowerCase(),
                    totalAmount: order.totalPrice,
                    items: order.orderItems.map(item => ({
                        itemId: item._id,
                        productId: item.product,
                        name: item.name,
                        quantity: item.quantity,
                        price: item.price,
                        image: item.image,
                        reviewed: false
                    })),
                    deliveryAddress: `${order.shippingInfo.address}, ${order.shippingInfo.city}, ${order.shippingInfo.country}`,
                    paymentMethod: order.paymentInfo?.status === 'succeeded' ? 'Card Payment' : 'Cash on Delivery'
                }))
                
                // Hydrate current product images from Cloudinary to keep consistent with homepage/admin
                const withImages = await hydrateProductImages(mappedOrders)
                // Hydrate review status per product for the current user
                const hydrated = await hydrateReviewStatus(withImages)
                setOrders(hydrated)
            } else {
                setError('Failed to fetch orders')
                toast.error('Failed to fetch orders')
            }
            
            setLoading(false)
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to fetch orders')
            setLoading(false)
            toast.error(error.response?.data?.message || 'Failed to fetch orders')
        }
    }

    // Ensure item images match the latest product image (Cloudinary) used across the site
    const hydrateProductImages = async (ordersList) => {
        try {
            const productIds = Array.from(new Set(
                ordersList.flatMap(o => (o.items || []).map(i => i.productId)).filter(Boolean)
            ))

            const imageMap = {}
            await Promise.all(productIds.map(async (pid) => {
                try {
                    const { data } = await axios.get(`/product/${pid}`)
                    const imgs = data?.product?.images || []
                    const url = imgs.length > 0 ? imgs[0].url : ''
                    if (url) imageMap[pid] = url
                } catch (_) {
                    // Leave missing products/images as-is so the placeholder fallback triggers
                }
            }))

            return ordersList.map(order => ({
                ...order,
                items: (order.items || []).map(item => ({
                    ...item,
                    image: imageMap[item.productId] || item.image
                }))
            }))
        } catch (_) {
            return ordersList
        }
    }

    // Fetch reviews for unique products and mark items reviewed by current user
    const hydrateReviewStatus = async (ordersList) => {
        try {
            const uid = user?._id
            if (!uid) return ordersList

            const productIds = Array.from(new Set(
                ordersList.flatMap(o => (o.items || []).map(i => i.productId)).filter(Boolean)
            ))

            const reviewMap = {}
            await Promise.all(productIds.map(async (pid) => {
                try {
                    const { data } = await axios.get('/reviews', { params: { productId: pid } })
                    const reviews = data?.product?.reviews || []
                    reviewMap[pid] = reviews.some(r => String(r.user) === String(uid))
                } catch (e) {
                    reviewMap[pid] = false
                }
            }))

            return ordersList.map(order => ({
                ...order,
                items: (order.items || []).map(item => ({
                    ...item,
                    reviewed: Boolean(reviewMap[item.productId])
                }))
            }))
        } catch (e) {
            return ordersList
        }
    }

    const getStatusBadge = (status) => {
        const statusConfig = {
            processing: { variant: 'warning', text: 'Processing' },
            shipped: { variant: 'info', text: 'Shipped' },
            delivered: { variant: 'success', text: 'Delivered' },
            cancelled: { variant: 'danger', text: 'Cancelled' },
            // Legacy status mappings for compatibility
            pending: { variant: 'warning', text: 'Pending' },
            confirmed: { variant: 'success', text: 'Confirmed' },
            preparing: { variant: 'info', text: 'Preparing' }
        }
        
        const config = statusConfig[status] || { variant: 'secondary', text: status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown' }
        return <Badge bg={config.variant}>{config.text}</Badge>
    }

    const handleCancelOrder = (order) => {
        setSelectedOrder(order)
        setShowCancelModal(true)
    }

    const confirmCancelOrder = async () => {
        try {
            // Mock API call - replace with actual endpoint
            console.log(`Cancelling order ${selectedOrder._id} with reason: ${cancelReason}`)
            
            // Update local state
            setOrders(orders.map(order => 
                order._id === selectedOrder._id 
                    ? { ...order, status: 'cancelled' }
                    : order
            ))
            
            toast.success('Order cancelled successfully')
            setShowCancelModal(false)
            setCancelReason('')
            setSelectedOrder(null)
        } catch (error) {
            toast.error('Failed to cancel order')
        }
    }

    const handleDeleteOrder = (orderId) => {
        setDeleteOrderId(orderId)
        setShowDeleteModal(true)
    }

    const confirmDeleteOrder = async () => {
        if (!deleteOrderId) return
        try {
            await axios.delete(`/order/${deleteOrderId}`)
            setOrders(orders.filter(order => order._id !== deleteOrderId))
            toast.success('Order deleted successfully')
        } catch (error) {
            const status = error.response?.status
            const msg =
                status === 403
                    ? 'You can only delete your own order'
                    : error.response?.data?.message || 'Failed to delete order'
            toast.error(msg)
        } finally {
            setShowDeleteModal(false)
            setDeleteOrderId(null)
        }
    }

    const handleReviewProduct = async (product, order) => {
        setSelectedProduct({ ...product, orderId: order._id })
        try {
            // If already reviewed, prefill existing rating/comment
            if (product.reviewed && user?._id) {
                const { data } = await axios.get('/reviews', { params: { productId: product.productId } })
                const existing = (data?.product?.reviews || []).find(r => String(r.user) === String(user._id))
                if (existing) {
                    setRating(Number(existing.rating) || 0)
                    setComment(String(existing.comment || ''))
                } else {
                    setRating(0)
                    setComment('')
                }
            } else {
                setRating(0)
                setComment('')
            }
        } catch (e) {
            setRating(0)
            setComment('')
        }
        setShowReviewModal(true)
    }

    const submitReview = async () => {
        try {
            if (rating === 0) {
                toast.error('Please select a rating')
                return
            }
            await axios.put('/review', {
                productId: selectedProduct.productId,
                rating,
                comment
            })

            // Update local state to mark product as reviewed
            setOrders(orders.map(order => 
                order._id === selectedProduct.orderId 
                    ? {
                        ...order,
                        items: order.items.map(item =>
                            item.productId === selectedProduct.productId
                                ? { ...item, reviewed: true }
                                : item
                        )
                    }
                    : order
            ))

            toast.success('Review submitted successfully!')
            setShowReviewModal(false)
            setRating(0)
            setComment('')
            setSelectedProduct(null)
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit review')
        }
    }

    if (loading) return <Loader />

    return (
        <>
            <MetaData title="My Orders - Nourishy" />
            <Container className="orders-container">
                <div className="orders-header">
                    <h1 className="orders-title">My Orders</h1>
                    <p className="orders-subtitle">Track and manage your food orders</p>
                </div>

                {error && (
                    <Alert variant="danger" className="mb-4">
                        {error}
                    </Alert>
                )}

                {orders.length === 0 ? (
                    <div className="empty-orders">
                        <div className="empty-orders-content">
                            <i className="fas fa-shopping-bag empty-orders-icon"></i>
                            <h3>No Orders Yet</h3>
                            <p>You haven't placed any orders yet. Start exploring our delicious menu!</p>
                            <Link to="/shop" className="btn btn-primary btn-lg">
                                Browse Menu
                            </Link>
                        </div>
                    </div>
                ) : (
                    <Row>
                        {orders.map(order => (
                            <Col key={order._id} lg={12} className="mb-4">
                                <Card className="order-card">
                                    <Card.Header className="order-card-header">
                                        <Row className="align-items-center">
                                            <Col md={6}>
                                                <h5 className="order-number">Order #{order.orderNumber}</h5>
                                                <small className="text-muted">
                                                    Placed on {new Date(order.orderDate).toLocaleDateString()}
                                                </small>
                                            </Col>
                                            <Col md={6} className="text-md-end">
                                                {getStatusBadge(order.status)}
                                                <div className="order-total mt-1">
                                                    <strong>₱{order.totalAmount.toFixed(2)}</strong>
                                                </div>
                                            </Col>
                                        </Row>
                                    </Card.Header>
                                    
                                    <Card.Body>
                                        <Row>
                                            <Col md={8}>
                                                <h6 className="mb-3">Order Items</h6>
                                                {order.items.map((item, index) => (
                                                    <div key={index} className="order-item mb-3">
                                                        <Row className="align-items-center">
                                                            <Col xs={2}>
                                                                <img 
                                                                    src={item.image} 
                                                                    alt={item.name}
                                                                    className="order-item-image"
                                                                    onError={(e) => {
                                                                        e.target.src = '/images/placeholder.jpg'
                                                                    }}
                                                                />
                                                            </Col>
                                                            <Col xs={6}>
                                                                <div className="order-item-name">{item.name}</div>
                                                                <small className="text-muted">Qty: {item.quantity}</small>
                                                                {(order.status === 'delivered') && (
                                                                    <div className="mt-2">
                                                                        {item.reviewed ? (
                                                                            <Button
                                                                                variant="outline-secondary"
                                                                                size="sm"
                                                                                onClick={() => handleReviewProduct(item, order)}
                                                                            >
                                                                                <i className="fas fa-edit me-1"></i>
                                                                                Update Review
                                                                            </Button>
                                                                        ) : (
                                                                            <Button
                                                                                variant="outline-warning"
                                                                                size="sm"
                                                                                onClick={() => handleReviewProduct(item, order)}
                                                                            >
                                                                                <i className="fas fa-star me-1"></i>
                                                                                Write Review
                                                                            </Button>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </Col>
                                                            <Col xs={4} className="text-end">
                                                                <div className="order-item-price">
                                                                    ₱{(item.price * item.quantity).toFixed(2)}
                                                                </div>
                                                            </Col>
                                                        </Row>
                                                    </div>
                                                ))}
                                            </Col>
                                            
                                            <Col md={4}>
                                                <div className="order-details">
                                                    <h6>Delivery Details</h6>
                                                    <p className="mb-2">
                                                        <i className="fas fa-map-marker-alt me-2"></i>
                                                        {order.deliveryAddress}
                                                    </p>
                                                    <p className="mb-3">
                                                        <i className="fas fa-credit-card me-2"></i>
                                                        {order.paymentMethod}
                                                    </p>
                                                    
                                                    <div className="order-actions">
                                                        {order.status === 'processing' && (
                                                            <Button 
                                                                variant="outline-warning" 
                                                                size="sm" 
                                                                className="me-2 mb-2"
                                                                onClick={() => handleCancelOrder(order)}
                                                            >
                                                                <i className="fas fa-times me-1"></i>
                                                                Cancel Order
                                                            </Button>
                                                        )}
                                                        
                                                        {(order.status === 'cancelled' || order.status === 'delivered') && (
                                                            <Button 
                                                                variant="outline-danger" 
                                                                size="sm" 
                                                                className="me-2 mb-2"
                                                                onClick={() => handleDeleteOrder(order._id)}
                                                            >
                                                                <i className="fas fa-trash me-1"></i>
                                                                Delete
                                                            </Button>
                                                        )}
                                                        
                                                        {/* Removed View Details button as requested */}
                                                    </div>
                                                </div>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}

                {/* Cancel Order Modal */}
                <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Cancel Order</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>Are you sure you want to cancel order #{selectedOrder?.orderNumber}?</p>
                        <div className="mb-3">
                            <label htmlFor="cancelReason" className="form-label">
                                Reason for cancellation (optional)
                            </label>
                            <textarea
                                id="cancelReason"
                                className="form-control"
                                rows="3"
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                placeholder="Please provide a reason for cancelling this order..."
                            />
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
                            Keep Order
                        </Button>
                        <Button variant="danger" onClick={confirmCancelOrder}>
                            Cancel Order
                        </Button>
                    </Modal.Footer>
                </Modal>

                {/* Review Modal */}
                <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>{selectedProduct?.reviewed ? 'Update Review' : 'Write a Review'}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {selectedProduct && (
                            <>
                                <div className="text-center mb-4">
                                    <img 
                                        src={selectedProduct.image} 
                                        alt={selectedProduct.name}
                                        className="img-fluid rounded"
                                        style={{ maxHeight: '100px', objectFit: 'cover' }}
                                        onError={(e) => {
                                            e.target.src = '/images/placeholder.jpg'
                                        }}
                                    />
                                    <h6 className="mt-2">{selectedProduct.name}</h6>
                                </div>
                                
                                <div className="mb-4">
                                    <label className="form-label fw-semibold">Rating</label>
                                    <div className="d-flex gap-2 justify-content-center">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                className="btn p-0 border-0"
                                                onClick={() => setRating(star)}
                                                style={{ fontSize: '1.5rem' }}
                                            >
                                                <i 
                                                    className={`fas fa-star ${star <= rating ? 'text-warning' : 'text-muted'}`}
                                                ></i>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="mb-4">
                                    <label className="form-label fw-semibold">Comment</label>
                                    <textarea
                                        className="form-control"
                                        rows="4"
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Share your experience with this product..."
                                        style={{ borderRadius: '8px' }}
                                    ></textarea>
                                </div>
                            </>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowReviewModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={submitReview}>
                            Submit Review
                        </Button>
                    </Modal.Footer>
                </Modal>

                {/* Delete Confirmation Modal */}
                <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Delete Order</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {(() => {
                            const target = orders.find(o => o._id === deleteOrderId)
                            const number = target?.orderNumber || deleteOrderId?.slice?.(-8)?.toUpperCase()
                            return (
                                <p>
                                    Are you sure you want to delete order #{number}? This action cannot be undone.
                                </p>
                            )
                        })()}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={confirmDeleteOrder}>
                            Delete
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </>
    )
}

export default Orders