const Product = require('../models/product');
const User = require('../models/user');
const connectDatabase = require('../config/database');
const products = require('../data/products.json');

const dotenv = require('dotenv');

// Setting dotenv file
dotenv.config({ path: './config/.env' });

connectDatabase();

const seedProducts = async () => {
    try {
        // First, create an admin user if it doesn't exist
        let adminUser = await User.findOne({ email: 'admin@nourishy.com' });
        
        if (!adminUser) {
            adminUser = await User.create({
                name: 'Admin User',
                email: 'admin@nourishy.com',
                password: 'admin123',
                role: 'admin',
                avatar: {
                    public_id: 'admin_avatar',
                    url: 'https://res.cloudinary.com/dkqnaqbvg/image/upload/v1/admin_avatar.jpg'
                }
            });
            console.log('Admin user created successfully with hashed password');
        }

        // Delete all existing products
        await Product.deleteMany();
        console.log('Products are deleted');

        // Add user reference to products and insert them
        const productsWithUser = products.map(product => ({
            ...product,
            user: adminUser._id
        }));

        await Product.insertMany(productsWithUser);
        console.log('All Products are added.');

        process.exit();

    } catch (error) {
        console.log(error.message);
        process.exit();
    }
}

const seedUsers = async () => {
    try {
        // Delete all existing users
        await User.deleteMany();
        console.log('Users are deleted');

        // Create sample users individually to trigger password hashing
        const sampleUsers = [
            {
                name: 'Admin User',
                email: 'admin@nourishy.com',
                password: 'admin123',
                role: 'admin',
                avatar: {
                    public_id: 'admin_avatar',
                    url: 'https://res.cloudinary.com/dkqnaqbvg/image/upload/v1/admin_avatar.jpg'
                }
            },
            {
                name: 'John Doe',
                email: 'john@example.com',
                password: 'password123',
                role: 'user',
                avatar: {
                    public_id: 'user_avatar_1',
                    url: 'https://res.cloudinary.com/dkqnaqbvg/image/upload/v1/user_avatar_1.jpg'
                }
            },
            {
                name: 'Jane Smith',
                email: 'jane@example.com',
                password: 'password123',
                role: 'user',
                avatar: {
                    public_id: 'user_avatar_2',
                    url: 'https://res.cloudinary.com/dkqnaqbvg/image/upload/v1/user_avatar_2.jpg'
                }
            }
        ];

        // Create users individually to ensure password hashing
        for (const userData of sampleUsers) {
            await User.create(userData);
            console.log(`User ${userData.name} created with hashed password`);
        }

        console.log('Sample users are added with hashed passwords.');

        process.exit();

    } catch (error) {
        console.log(error.message);
        process.exit();
    }
}

// Check command line arguments
if (process.argv[2] === '--import') {
    seedProducts();
} else if (process.argv[2] === '--delete') {
    deleteData();
} else if (process.argv[2] === '--users') {
    seedUsers();
} else {
    console.log('Please specify --import, --delete, or --users');
    process.exit();
}

async function deleteData() {
    try {
        await Product.deleteMany();
        await User.deleteMany();
        console.log('Data Destroyed!');
        process.exit();
    } catch (error) {
        console.log(error.message);
        process.exit();
    }
}