const express = require('express');
const router = express.Router();

const { 
    getProducts,
    newProduct,
    getSingleProduct,
    getFeaturedProducts,
    getAdminProducts,
    updateProduct,
    deleteProduct,
    bulkDeleteProducts,
    createOrUpdateReview,
    getProductReviews,
    getAllReviewsAdmin,
    deleteReviewAdmin
} = require('../controllers/productController');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');
const { upload } = require('../middlewares/upload');

router.route('/products').get(getProducts);
router.route('/products/featured').get(getFeaturedProducts);
// Public single
router.route('/product/:id').get(getSingleProduct);

// Reviews
router.route('/review').put(isAuthenticatedUser, createOrUpdateReview);
router.route('/reviews').get(getProductReviews);
router.route('/admin/reviews').get(isAuthenticatedUser, authorizeRoles('admin'), getAllReviewsAdmin);
router.route('/admin/review/:productId/:id').delete(isAuthenticatedUser, authorizeRoles('admin'), deleteReviewAdmin);

// Admin product management
router.route('/admin/products').get(isAuthenticatedUser, authorizeRoles('admin'), getAdminProducts);
router.route('/admin/product/new').post(isAuthenticatedUser, authorizeRoles('admin'), upload.array('images', 6), newProduct);
router.route('/admin/product/:id')
    .put(isAuthenticatedUser, authorizeRoles('admin'), upload.array('images', 6), updateProduct)
    .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteProduct);
router.route('/admin/products/bulk-delete').post(isAuthenticatedUser, authorizeRoles('admin'), bulkDeleteProducts);

module.exports = router;