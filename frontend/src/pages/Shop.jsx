import React, { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Container, Row, Col, Card, Button, Form, Badge, Pagination } from 'react-bootstrap'
import axios from 'axios'
import MetaData from '../Components/Layout/MetaData'
import Loader from '../Components/Layout/Loader'
import { toast } from 'react-toastify'
import { useAuth } from '../contexts/AuthContext'
import '../styles/Shop.css'

const Shop = ({ addItemToCart, cartItems }) => {
    const { isAuthenticated } = useAuth()
    const navigate = useNavigate()
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [filteredProducts, setFilteredProducts] = useState([])
    const [selectedCategory, setSelectedCategory] = useState('All')
    const [sortBy, setSortBy] = useState('featured')
    const [priceRange, setPriceRange] = useState([0, 5000])
    const [searchQuery, setSearchQuery] = useState('')
    const [showFilters, setShowFilters] = useState(false)
    const [minRating, setMinRating] = useState(0)
    const [onlyReviewed, setOnlyReviewed] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [productsPerPage] = useState(12)
    const [searchParams, setSearchParams] = useSearchParams()

    // Categories based on the product data
    const categories = ['All', 'Shampoo', 'Conditioner', 'Hair Oil', 'Hair Mask', 'Hair Serum', 'Hair Spray']

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
            const { data } = await axios.get('/products')
            setProducts(data.products || [])
            setFilteredProducts(data.products || [])
            setLoading(false)
        } catch (error) {
            console.error('Error fetching products:', error)
            toast.error('Failed to load products')
            setLoading(false)
        }
    }

    // Filter and sort products
    const filterAndSortProducts = () => {
        let filtered = [...products]

        // Filter by category
        if (selectedCategory !== 'All') {
            filtered = filtered.filter(product => product.category === selectedCategory)
        }

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.description.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        // Filter by price range
        filtered = filtered.filter(product =>
            product.price >= priceRange[0] && product.price <= priceRange[1]
        )

        // Filter by minimum rating
        if (minRating > 0) {
            filtered = filtered.filter(product => (product.ratings || 0) >= minRating)
        }

        // Filter to only products with at least one review
        if (onlyReviewed) {
            filtered = filtered.filter(product => (product.numOfReviews || 0) > 0)
        }

        // Sort products
        switch (sortBy) {
            case 'price-low':
                filtered.sort((a, b) => (a.price || 0) - (b.price || 0))
                break
            case 'price-high':
                filtered.sort((a, b) => (b.price || 0) - (a.price || 0))
                break
            case 'rating':
                filtered.sort((a, b) => (b.ratings || 0) - (a.ratings || 0))
                break
            case 'name':
                filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
                break
            case 'newest':
                filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
                break
            case 'featured':
                filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
                break
            default:
                // leave API/default order
                break
        }

        setFilteredProducts(filtered)
        setCurrentPage(1)
    }

    // Get product image with fallback
    const getProductImage = (product) => {
        if (product.images && product.images.length > 0) {
            return product.images[0].url
        }
        return fallbackImages[product.category] || fallbackImages['Shampoo']
    }

    // Helper function to render stars
    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < fullStars; i++) {
            stars.push(
                <i key={i} className="fa fa-star star-rating" style={{color: '#ffc107'}}></i>
            );
        }

        if (hasHalfStar) {
            stars.push(
                <i key="half" className="fa fa-star-half-o star-rating" style={{color: '#ffc107'}}></i>
            );
        }

        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(
                <i key={`empty-${i}`} className="fa fa-star-o" style={{color: '#e4e5e9'}}></i>
            );
        }

        return stars;
    };



    // Add to cart handler
    const addToCartHandler = async (productId) => {
        if (!isAuthenticated) {
            navigate(`/loginregister?redirect=${encodeURIComponent(window.location.pathname)}`)
            return
        }
        
        try {
            await addItemToCart(productId, 1)
        } catch (error) {
            toast.error('Failed to add item to cart')
        }
    }

    // Pagination
    const indexOfLastProduct = currentPage * productsPerPage
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct)
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage)

    useEffect(() => {
        fetchProducts()
    }, [])

    useEffect(() => {
        filterAndSortProducts()
    }, [products, selectedCategory, sortBy, priceRange, searchQuery, minRating, onlyReviewed])

    // Update URL params when filters change
    useEffect(() => {
        const params = new URLSearchParams()
        if (selectedCategory !== 'All') params.set('category', selectedCategory)
        if (sortBy !== 'featured') params.set('sort', sortBy)
        if (searchQuery) params.set('search', searchQuery)
        if (minRating > 0) params.set('minRating', String(minRating))
        if (onlyReviewed) params.set('reviewed', 'true')
        setSearchParams(params)
    }, [selectedCategory, sortBy, searchQuery, minRating, onlyReviewed, setSearchParams])

    if (loading) {
        return <Loader />
    }

    return (
        <>
            <MetaData title={'Shop - Nourishy Hair Products'} />
            
            {/* Breadcrumb */}
            <div className="bg-light border-bottom">
                <Container className="py-3">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb mb-0">
                            <li className="breadcrumb-item">
                                <Link to="/" className="text-decoration-none">
                                    <i className="fa fa-home me-1"></i>Home
                                </Link>
                            </li>
                            <li className="breadcrumb-item active" aria-current="page">Shop</li>
                        </ol>
                    </nav>
                </Container>
            </div>

            {/* Hero Section */}
            <section className="bg-primary-bg py-5">
                <Container>
                    <Row className="text-center">
                        <Col>
                            <h1 className="display-4 fw-bold text-dark mb-3">
                                Professional Hair Care Collection
                            </h1>
                            <p className="lead text-muted mb-4">
                                Discover our complete range of premium hair products, crafted with natural ingredients for every hair type and concern.
                            </p>
                            
                            {/* Search Bar */}
                            <Row className="justify-content-center">
                                <Col md={8} lg={6}>
                                    <div className="position-relative">
                                        <Form.Control
                                            type="text"
                                            placeholder="Search products..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="ps-5 py-3"
                                            style={{borderRadius: '25px'}}
                                        />
                                        <i className="fa fa-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
                                    </div>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Main Content */}
            <Container className="py-4">
                <Row>
                    {/* Sidebar Filters */}
                    <Col lg={3} className="mb-4">
                        <Card className="shadow-sm sticky-top" style={{top: '20px'}}>
                            <Card.Header className="bg-white">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0 fw-semibold">Filters</h5>
                                    <Button
                                        variant="link"
                                        className="d-lg-none text-primary p-0"
                                        onClick={() => setShowFilters(!showFilters)}
                                    >
                                        <i className="fa fa-filter"></i>
                                    </Button>
                                </div>
                            </Card.Header>
                            <Card.Body className={`${showFilters ? 'd-block' : 'd-none d-lg-block'}`}>
                                {/* Categories */}
                                <div className="mb-4">
                                    <h6 className="fw-semibold mb-3">Categories</h6>
                                    <div className="d-grid gap-2">
                                        {categories.map(category => (
                                            <Button
                                                key={category}
                                                variant={selectedCategory === category ? 'primary' : 'outline-secondary'}
                                                size="sm"
                                                onClick={() => setSelectedCategory(category)}
                                                className="text-start"
                                            >
                                                {category}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                {/* Price Range */}
                                <div className="mb-4">
                                    <h6 className="fw-semibold mb-3">Price Range</h6>
                                    <div className="mb-2">
                                        <div className="d-flex justify-content-between small text-muted">
                                            <span>₱{priceRange[0]}</span>
                                            <span>₱{priceRange[1]}</span>
                                        </div>
                                        <Form.Range
                                            min="0"
                                            max="5000"
                                            value={priceRange[1]}
                                            onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                                        />
                                    </div>
                                </div>

                                {/* Reviews */}
                                <div className="mb-4">
                                    <h6 className="fw-semibold mb-3">Reviews</h6>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small">Minimum rating</Form.Label>
                                        <Form.Select
                                            value={minRating}
                                            onChange={(e) => setMinRating(Number(e.target.value))}
                                            size="sm"
                                        >
                                            <option value="0">All ratings</option>
                                            <option value="4">4+ stars</option>
                                            <option value="3">3+ stars</option>
                                            <option value="2">2+ stars</option>
                                            <option value="1">1+ star</option>
                                        </Form.Select>
                                    </Form.Group>

                                    <Form.Check
                                        type="checkbox"
                                        id="onlyReviewed"
                                        label="Only show reviewed products"
                                        checked={onlyReviewed}
                                        onChange={(e) => setOnlyReviewed(e.target.checked)}
                                    />
                                </div>

                                {/* Clear Filters */}
                                <Button
                                    variant="outline-primary"
                                    size="sm"
                                    className="w-100"
                                    onClick={() => {
                                        setSelectedCategory('All')
                                        setSortBy('featured')
                                        setPriceRange([0, 5000])
                                        setSearchQuery('')
                                        setMinRating(0)
                                        setOnlyReviewed(false)
                                    }}
                                >
                                    Clear All Filters
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Products Section */}
                    <Col lg={9}>
                        {/* Products Header */}
                        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-4">
                            <div>
                                <h2 className="h3 fw-bold mb-1">
                                    {selectedCategory === 'All' ? 'All Products' : selectedCategory}
                                </h2>
                                <p className="text-muted mb-0">
                                    {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
                                </p>
                            </div>
                            
                            <div className="d-flex align-items-center gap-3">
                                <Form.Label className="mb-0 fw-medium text-nowrap">Sort by:</Form.Label>
                                <Form.Select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    size="sm"
                                    style={{minWidth: '150px'}}
                                >
                                    <option value="featured">Featured</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                    <option value="rating">Highest Rated</option>
                                    <option value="newest">Newest</option>
                                </Form.Select>
                            </div>
                        </div>

                        {/* Products Grid */}
                        {currentProducts.length > 0 ? (
                            <Row className="g-4 mb-5">
                                {currentProducts.map(product => (
                                    <Col key={product._id} xs={12} sm={6} lg={4}>
                                        <Card className="h-100 shadow-sm border-0 product-card">
                                            <div className="position-relative overflow-hidden">
                                                <Card.Img
                                                    variant="top"
                                                    src={getProductImage(product)}
                                                    alt={product.name}
                                                    style={{height: '250px', objectFit: 'cover'}}
                                                    className="product-image"
                                                />
                                                <div className="position-absolute bottom-0 start-0 w-100 bg-gradient-dark p-3">
                                                    <Badge bg="light" text="dark" className="small">{product.category}</Badge>
                                                </div>
                                                {product.stock === 0 && (
                                                    <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50">
                                                        <Badge bg="danger" className="px-3 py-2">
                                                            Out of Stock
                                                        </Badge>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <Card.Body className="d-flex flex-column">
                                                <Card.Title className="h6 mb-2" style={{
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden'
                                                }}>
                                                    {product.name}
                                                </Card.Title>
                                                
                                                <Card.Text className="text-muted small mb-3" style={{
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden'
                                                }}>
                                                    {product.description}
                                                </Card.Text>
                                                
                                                {/* Rating */}
                                                <div className="d-flex align-items-center mb-3">
                                                    <div className="d-flex align-items-center me-2">
                                                        {renderStars(product.ratings)}
                                                    </div>
                                                    <span className="fw-semibold small">{product.ratings || 0}</span>
                                                    <span className="text-muted small ms-1">({product.numOfReviews || 0})</span>
                                                </div>

                                                {/* Price and Actions */}
                                                <div className="mt-auto pt-3 border-top">
                                                    <div className="d-flex align-items-center justify-content-between mb-3">
                                                        <h5 className="text-primary fw-bold mb-0">
                                                            ₱{product.price}
                                                        </h5>
                                                    </div>
                                                    
                                                    <div className="d-flex gap-2">
                                                        <Button
                                                            as={Link}
                                                            to={`/product/${product._id}`}
                                                            variant="outline-primary"
                                                            size="sm"
                                                            className="flex-fill"
                                                        >
                                                            View
                                                        </Button>
                                                        <Button
                                                             onClick={() => addToCartHandler(product._id)}
                                                             disabled={product.stock === 0}
                                                             variant="primary"
                                                             size="sm"
                                                             className="flex-fill"
                                                         >
                                                             Add to Cart
                                                         </Button>
                                                    </div>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        ) : (
                            <div className="text-center py-5">
                                <div className="text-muted mb-4">
                                    <i className="fa fa-shopping-bag fa-4x"></i>
                                </div>
                                <h4 className="fw-semibold mb-2">No products found</h4>
                                <p className="text-muted mb-4">Try adjusting your search or filter criteria</p>
                                <Button
                                    variant="primary"
                                    onClick={() => {
                                        setSelectedCategory('All')
                                        setSortBy('featured')
                                        setPriceRange([0, 5000])
                                        setSearchQuery('')
                                    }}
                                >
                                    Clear Filters
                                </Button>
                            </div>
                        )}

                        {/* Pagination */}
                        {filteredProducts.length > productsPerPage && (
                            <div className="d-flex justify-content-center mt-4">
                                <Pagination>
                                    <Pagination.Prev
                                        onClick={() => setCurrentPage(currentPage - 1)}
                                        disabled={currentPage === 1}
                                    />
                                    
                                    {Array.from({ length: totalPages }, (_, index) => (
                                        <Pagination.Item
                                            key={index + 1}
                                            active={currentPage === index + 1}
                                            onClick={() => setCurrentPage(index + 1)}
                                        >
                                            {index + 1}
                                        </Pagination.Item>
                                    ))}
                                    
                                    <Pagination.Next
                                        onClick={() => setCurrentPage(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                    />
                                </Pagination>
                            </div>
                        )}
                    </Col>
                </Row>
            </Container>
        </>
    )
}

export default Shop