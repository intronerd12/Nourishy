const Product = require('../models/product');

// Create new product => /api/v1/product/new
exports.newProduct = async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json({
            success: true,
            product
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Get all products => /api/v1/products
exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find();
        const count = products.length;
        // Align response shape with frontend expectations
        res.status(200).json({
            success: true,
            products,
            productsCount: count,
            resPerPage: count, // no pagination implemented yet
            filteredProductsCount: count
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Get single product => /api/v1/product/:id
exports.getSingleProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        res.status(200).json({
            success: true,
            product
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Get featured products => /api/v1/products/featured
exports.getFeaturedProducts = async (req, res) => {
    try {
        const featuredProducts = await Product.find({ featured: true });
        const count = featuredProducts.length;
        
        res.status(200).json({
            success: true,
            products: featuredProducts,
            productsCount: count,
            resPerPage: count,
            filteredProductsCount: count
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};