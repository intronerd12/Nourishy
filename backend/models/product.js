const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter product name'],
        trim: true,
        maxLength: [100, 'Product name cannot exceed 100 characters']
    },
    price: {
        type: Number,
        required: [true, 'Please enter product price'],
        maxLength: [5, 'Product price cannot exceed 5 characters']
    },
    description: {
        type: String,
        required: [true, 'Please enter product description']
    },
    category: {
        type: String,
        required: [true, 'Please select category for this product'],
        enum: {
            values: [
                'Shampoo',
                'Conditioner',
                'Hair Oil',
                'Hair Mask',
                'Hair Serum',
                'Hair Spray',
                'Hair Color',
                'Hair Styling',
                'Hair Accessories'
            ]
        },
        default: 'Shampoo'
    },
    brand: {
        type: String,
        default: 'Nourishy'
    },
    seller: {
        type: String,
        default: 'Nourishy'
    },
    images: [
        {
            public_id: { type: String },
            url: { type: String }
        }
    ],
    ratings: {
        type: Number,
        default: 0
    },
    numOfReviews: {
        type: Number,
        default: 0
    },
    reviews: [
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
                required: true
            },
            name: { 
                type: String,
                required: true
            },
            rating: { 
                type: Number,
                required: true,
                min: [1, 'Rating must be at least 1'],
                max: [5, 'Rating cannot exceed 5']
            },
            comment: { 
                type: String,
                required: true
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    stock: {
        type: Number,
        required: [true, 'Please enter product stock'],
        maxLength: [5, 'Product stock cannot exceed 5 characters'],
        default: 0
    },
    featured: {
        type: Boolean,
        default: false
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Product', productSchema);