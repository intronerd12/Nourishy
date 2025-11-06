const mongoose = require('mongoose');
const Order = require('./models/order');
const User = require('./models/user');
const Product = require('./models/product');
const connectDatabase = require('./config/database');

const dotenv = require('dotenv');
dotenv.config({ path: './config/.env' });

connectDatabase();

const createSampleOrder = async () => {
    try {
        // Find an existing user (prefer a regular user, fallback to any user)
        let user = await User.findOne({ role: 'user' });
        if (!user) {
            user = await User.findOne({});
        }
        if (!user) {
            console.log('No user found. Please run the seeder first.');
            process.exit(1);
        }

        // Find some products
        const products = await Product.find().limit(2);
        if (products.length === 0) {
            console.log('No products found. Please run the seeder first.');
            process.exit(1);
        }

        // Create a sample order
        const sampleOrder = {
            shippingInfo: {
                address: '123 Main Street',
                city: 'Manila',
                phoneNo: '+639123456789',
                postalCode: '1000',
                country: 'Philippines'
            },
            user: user._id,
            orderItems: products.map(product => ({
                name: product.name,
                quantity: 2,
                image: product.images[0].url,
                price: product.price,
                product: product._id
            })),
            paymentInfo: {
                id: 'sample_payment_id',
                status: 'succeeded'
            },
            itemsPrice: products.reduce((total, product) => total + (product.price * 2), 0),
            taxPrice: 50,
            shippingPrice: 100,
            totalPrice: products.reduce((total, product) => total + (product.price * 2), 0) + 50 + 100,
            // Status defaults to 'Pending' in the model
        };

        const order = await Order.create(sampleOrder);
        console.log('Sample order created successfully:');
        console.log('Order ID:', order._id);
        console.log('Total Price:', order.totalPrice);
        console.log('Status:', order.orderStatus);

        // Check if we can fetch orders for this user
        const userOrders = await Order.find({ user: user._id });
        console.log(`\nFound ${userOrders.length} orders for user ${user.name}`);

        process.exit(0);
    } catch (error) {
        console.error('Error creating sample order:', error);
        process.exit(1);
    }
};

createSampleOrder();