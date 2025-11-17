const Product = require('../models/product');
const { cloudinary } = require('../config/cloudinary');
const fs = require('fs');
const Order = require('../models/order');

async function uploadImagesToCloudinary(files) {
    const imagesLinks = [];
    for (const file of files || []) {
        const filePath = file.path;
        const result = await cloudinary.uploader.upload(filePath, {
            folder: 'products',
            width: 800,
            crop: 'scale'
        });
        imagesLinks.push({ public_id: result.public_id, url: result.secure_url });
        try { fs.unlinkSync(filePath); } catch (e) {}
    }
    return imagesLinks;
}

// Create new product with optional multiple images => /api/v1/admin/product/new
exports.newProduct = async (req, res) => {
    try {
        const files = req.files || [];
        let images = [];
        if (files.length > 0) {
            try {
                images = await uploadImagesToCloudinary(files);
            } catch (e) {
                // If Cloudinary is not configured or upload fails, proceed without images
                try { files.forEach(f => f?.path && fs.existsSync(f.path) && fs.unlinkSync(f.path)); } catch (_) {}
                console.error('Image upload failed, proceeding without images:', e?.message || e);
                images = [];
            }
        }

        // Ensure required ownership field is set from authenticated user
        const payload = { ...req.body, user: req.user?._id };
        if (images.length > 0) payload.images = images;

        const product = await Product.create(payload);
        return res.status(201).json({ success: true, product });
    } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
    }
};

// Public: Get all products => /api/v1/products
exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find();
        const count = products.length;
        return res.status(200).json({
            success: true,
            products,
            productsCount: count,
            resPerPage: count,
            filteredProductsCount: count
        });
    } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
    }
};

// Public: Get single product => /api/v1/product/:id
exports.getSingleProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
        return res.status(200).json({ success: true, product });
    } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
    }
};

// Public: Get featured products => /api/v1/products/featured
exports.getFeaturedProducts = async (req, res) => {
    try {
        const featuredProducts = await Product.find({ featured: true });
        const count = featuredProducts.length;
        return res.status(200).json({ success: true, products: featuredProducts, productsCount: count, resPerPage: count, filteredProductsCount: count });
    } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
    }
};

// Admin: get all products => /api/v1/admin/products
exports.getAdminProducts = async (req, res) => {
    try {
        const products = await Product.find();
        return res.status(200).json({ success: true, products });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

// Admin: update product with optional new images => /api/v1/admin/product/:id
exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

        const files = req.files || [];
        let images = product.images || [];
        const clearAll = String(req.body.clearAllImages || '').toLowerCase() === 'true';
        // Parse lists of specific image identifiers to remove (public_ids and/or urls)
        let removeIds = [];
        if (req.body.removeImagePublicIds) {
            try {
                removeIds = JSON.parse(req.body.removeImagePublicIds);
            } catch (_) {
                removeIds = String(req.body.removeImagePublicIds).split(',').map(s => s.trim()).filter(Boolean);
            }
        }
        let removeUrls = [];
        if (req.body.removeImageUrls) {
            try {
                removeUrls = JSON.parse(req.body.removeImageUrls);
            } catch (_) {
                removeUrls = String(req.body.removeImageUrls).split(',').map(s => s.trim()).filter(Boolean);
            }
        }

        if (clearAll) {
            images = [];
        } else if (removeIds.length > 0 || removeUrls.length > 0) {
            // Attempt to destroy on Cloudinary for public_ids, ignore failures
            for (const pid of removeIds) {
                try { await cloudinary.uploader.destroy(pid); } catch (_) {}
            }
            images = (images || []).filter(img => !removeIds.includes(img.public_id) && !removeUrls.includes(img.url));
        }

        if (files.length > 0) {
            try {
                const uploaded = await uploadImagesToCloudinary(files);
                images = uploaded.length > 0 ? [...images, ...uploaded] : images;
            } catch (e) {
                // Cleanup temp files and keep existing images on failure
                try { files.forEach(f => f?.path && fs.existsSync(f.path) && fs.unlinkSync(f.path)); } catch (_) {}
                console.error('Image upload failed, keeping existing images:', e?.message || e);
            }
        }

        const payload = { ...req.body, images };
        const updated = await Product.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
        return res.status(200).json({ success: true, product: updated });
    } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
    }
};

// Admin: delete single product => /api/v1/admin/product/:id
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
        return res.status(200).json({ success: true, message: 'Product deleted' });
    } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
    }
};

// Admin: bulk delete products => /api/v1/admin/products/bulk-delete
exports.bulkDeleteProducts = async (req, res) => {
    try {
        const ids = Array.isArray(req.body.ids) ? req.body.ids : [];
        if (ids.length === 0) return res.status(400).json({ success: false, message: 'No product IDs provided' });

        // Fetch products first to clean up Cloudinary assets
        const products = await Product.find({ _id: { $in: ids } });
        for (const p of products) {
            try {
                for (const img of (p.images || [])) {
                    if (img.public_id) {
                        try { await cloudinary.uploader.destroy(img.public_id); } catch (_) {}
                    }
                }
            } catch (_) {}
        }

        const result = await Product.deleteMany({ _id: { $in: ids } });
        return res.status(200).json({ success: true, deletedCount: result.deletedCount });
    } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
    }
};

// Profanity filter: prefer bad-words, but fall back safely if module format mismatches
let Filter;
try {
    Filter = require('bad-words');
} catch (err) {
    // Fallback filter with expanded dictionary and simple cleaning
    Filter = class {
        constructor() {
            this.words = [
                'fuck','shit','bitch','asshole','cunt','slut','whore','bastard','dick','pussy','cock','prick','twat','wank','jerk','retard','faggot','nigger','motherfucker','bullshit'
            ];
        }
        clean(text = '') {
            let result = String(text);
            this.words.forEach(w => {
                const re = new RegExp(`\\b${w}\\b`, 'gi');
                result = result.replace(re, '*'.repeat(w.length));
            });
            return result;
        }
    }
}
const profanityFilter = new Filter()

// Add extra words if the library supports it
try {
    if (typeof profanityFilter.addWords === 'function') {
        profanityFilter.addWords(
            'cunt','slut','whore','bastard','dick','pussy','cock','prick','twat','wank','jerk','retard','faggot','nigger','motherfucker','bullshit',
            // common near-misses
            'fck','fuk','fuq','bi7ch','b1tch','a55','sh1t'
        );
    }
} catch (_) {}

// Advanced cleaner: catches leetspeak and separator-obfuscated variants
const LEET_MAP = {
    a: 'a@4', i: 'i1!|', e: 'e3', o: 'o0', s: 's$5', t: 't7',
    b: 'b8', g: 'g9', c: 'c(', k: 'k', u: 'u', h: 'h', r: 'r',
    n: 'n', d: 'd', m: 'm', f: 'f', p: 'p', y: 'y', w: 'w'
};

const BASE_BAD_WORDS = [
    'fuck','shit','bitch','asshole','cunt','slut','whore','bastard','dick','pussy','cock','prick','twat','wank','jerk','retard','faggot','nigger','motherfucker','bullshit'
];

function buildObfuscatedRegex(word) {
    const pattern = word
        .toLowerCase()
        .split('')
        .map(ch => `[${(LEET_MAP[ch] || ch)}]` + '(?:[\\W_]*?)')
        .join('');
    return new RegExp(`\\b${pattern}\\b`, 'gi');
}

// Matches shorthand variants by allowing vowels to be omitted (e.g., fck for fuck)
const VOWELS = new Set(['a','e','i','o','u']);
function buildShortcutRegex(word) {
    const pattern = word
        .toLowerCase()
        .split('')
        .map(ch => {
            const cls = `[${(LEET_MAP[ch] || ch)}]`;
            const seg = '(?:[\\W_]*?)';
            // vowels optional, consonants required
            return VOWELS.has(ch) ? `(?:${cls})?${seg}` : `${cls}${seg}`;
        })
        .join('');
    return new RegExp(`\\b${pattern}\\b`, 'gi');
}

function advancedClean(text = '') {
    let result = String(text);
    for (const w of BASE_BAD_WORDS) {
        const re1 = buildObfuscatedRegex(w);
        const re2 = buildShortcutRegex(w);
        result = result.replace(re1, (match) => '*'.repeat(match.replace(/[\W_]/g, '').length));
        result = result.replace(re2, (match) => '*'.repeat(match.replace(/[\W_]/g, '').length));
    }
    // Mask common censored forms like f***, s***, etc.
    result = result.replace(/\b([fs]h?)[*]{2,,}\b/gi, (m) => '*'.repeat(m.length));
    return result;
}

function sanitizeComment(text = '') {
    const step1 = advancedClean(String(text).trim());
    return profanityFilter.clean(step1);
}

// Create or update a review => /api/v1/review
exports.createOrUpdateReview = async (req, res) => {
    try {
        const userId = req.user?._id;
        const userName = req.user?.name || 'Anonymous';
        const { productId, rating, comment } = req.body || {};

        if (!productId) return res.status(400).json({ success: false, message: 'productId is required' });
        const numericRating = Number(rating);
        if (!numericRating || numericRating < 1 || numericRating > 5) {
            return res.status(400).json({ success: false, message: 'Rating must be a number between 1 and 5' });
        }
        if (!comment || String(comment).trim().length === 0) {
            return res.status(400).json({ success: false, message: 'Comment is required' });
        }

        // Only allow reviews from users who purchased the product
        const hasPurchased = await Order.findOne({
            user: userId,
            'orderItems.product': productId
        }).lean();
        if (!hasPurchased) {
            return res.status(403).json({ success: false, message: 'Only customers who purchased can review this product' });
        }

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

        // Check if user already reviewed
        const existingIndex = (product.reviews || []).findIndex(r => String(r.user) === String(userId));
        // Sanitize/Mask profane words from the comment (handles leetspeak and obfuscations)
        const sanitizedComment = sanitizeComment(String(comment).trim())

        const reviewPayload = {
            user: userId,
            name: userName,
            rating: numericRating,
            comment: sanitizedComment,
            createdAt: new Date()
        };

        let action = 'created';
        if (existingIndex >= 0) {
            product.reviews[existingIndex].rating = numericRating;
            product.reviews[existingIndex].comment = sanitizedComment;
            product.reviews[existingIndex].createdAt = new Date();
            action = 'updated';
        } else {
            product.reviews.push(reviewPayload);
        }

        product.numOfReviews = (product.reviews || []).length;
        const sum = (product.reviews || []).reduce((acc, r) => acc + Number(r.rating || 0), 0);
        product.ratings = product.numOfReviews > 0 ? Number((sum / product.numOfReviews).toFixed(1)) : 0;

        await product.save({ validateBeforeSave: false });
        return res.status(200).json({ success: true, message: `Review ${action}`, product });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

// Get reviews for a product => /api/v1/reviews?productId=...
exports.getProductReviews = async (req, res) => {
    try {
        const { productId } = req.query || {};
        if (!productId) return res.status(400).json({ success: false, message: 'productId query is required' });
        const product = await Product.findById(productId).select('name reviews ratings numOfReviews');
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
        return res.status(200).json({ success: true, product });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

// Admin: List all reviews across products => /api/v1/admin/reviews
exports.getAllReviewsAdmin = async (req, res) => {
    try {
        const products = await Product.find().select('name reviews');
        const reviews = [];
        for (const p of products) {
            for (const r of p.reviews || []) {
                reviews.push({
                    productId: p._id,
                    productName: p.name,
                    reviewId: r._id,
                    userId: r.user,
                    userName: r.name,
                    rating: r.rating,
                    comment: r.comment,
                    createdAt: r.createdAt
                });
            }
        }
        return res.status(200).json({ success: true, reviews });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

// Admin: Delete a review => /api/v1/admin/review/:productId/:id
exports.deleteReviewAdmin = async (req, res) => {
    try {
        const { productId, id } = req.params || {};
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

        const originalLength = (product.reviews || []).length;
        product.reviews = (product.reviews || []).filter(r => String(r._id) !== String(id));
        if (product.reviews.length === originalLength) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        product.numOfReviews = product.reviews.length;
        const sum = (product.reviews || []).reduce((acc, r) => acc + Number(r.rating || 0), 0);
        product.ratings = product.numOfReviews > 0 ? Number((sum / product.numOfReviews).toFixed(1)) : 0;

        await product.save({ validateBeforeSave: false });
        return res.status(200).json({ success: true, message: 'Review deleted' });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};