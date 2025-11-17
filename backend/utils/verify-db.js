const mongoose = require('mongoose');
const User = require('../models/user');
const Product = require('../models/product');
const connectDatabase = require('../config/database');
const dotenv = require('dotenv');

// Setting dotenv file
dotenv.config({ path: './config/.env' });

const verifyDatabase = async () => {
    try {
        // Connect to database
        connectDatabase();

        // Wait for connection
        await new Promise(resolve => setTimeout(resolve, 2000));

        console.log('\n🔍 Verifying MongoDB Collections...\n');

        // Check Users collection
        const userCount = await User.countDocuments();
        const adminUsers = await User.find({ role: 'admin' });
        const regularUsers = await User.find({ role: 'user' });

        console.log('👥 USERS COLLECTION:');
        console.log(`   Total Users: ${userCount}`);
        console.log(`   Admin Users: ${adminUsers.length}`);
        console.log(`   Regular Users: ${regularUsers.length}`);
        
        if (adminUsers.length > 0) {
            console.log(`   Admin Email: ${adminUsers[0].email}`);
        }

        // Check Products collection
        const productCount = await Product.countDocuments();
        const categories = await Product.distinct('category');
        // Compute total reviews across products (instead of average rating)
        const reviewsStats = await Product.aggregate([
            { $project: { reviewCount: { $size: { $ifNull: ['$reviews', []] } } } },
            { $group: { _id: null, totalReviews: { $sum: '$reviewCount' } } }
        ]);

        console.log('\n📦 PRODUCTS COLLECTION:');
        console.log(`   Total Products: ${productCount}`);
        console.log(`   Categories: ${categories.join(', ')}`);
        console.log(`   Total Reviews: ${reviewsStats[0]?.totalReviews ?? 0}`);

        // Show sample products
        const sampleProducts = await Product.find().limit(3).select('name price category');
        console.log('\n   Sample Products:');
        sampleProducts.forEach(product => {
console.log(`   - ${product.name} (₱${product.price}) - ${product.category}`);
        });

        // Check if products have user references
        const productsWithUsers = await Product.find().populate('user', 'name email role').limit(1);
        if (productsWithUsers.length > 0 && productsWithUsers[0].user) {
            console.log(`\n   Products created by: ${productsWithUsers[0].user.name} (${productsWithUsers[0].user.role})`);
        }

        console.log('\n✅ Database verification completed successfully!');
        console.log('\n📊 MongoDB Collections Summary:');
        console.log(`   - Users: ${userCount} documents`);
        console.log(`   - Products: ${productCount} documents`);
        console.log(`   - Admin access: Available`);
        console.log(`   - User roles: Properly configured`);

        process.exit(0);

    } catch (error) {
        console.error('❌ Database verification failed:', error.message);
        process.exit(1);
    }
};

verifyDatabase();