const mongoose = require('mongoose');
const User = require('../models/user');
const connectDatabase = require('../config/database');
const dotenv = require('dotenv');

// Setting dotenv file
dotenv.config({ path: './config/.env' });

const checkPasswords = async () => {
    try {
        // Connect to database
        connectDatabase();

        // Wait for connection
        await new Promise(resolve => setTimeout(resolve, 2000));

        console.log('\n🔍 Checking User Password Hashing...\n');

        // Get all users with passwords (normally hidden)
        const users = await User.find().select('+password');

        console.log('👥 User Password Status:');
        users.forEach(user => {
            const isHashed = user.password.startsWith('$2a$') || user.password.startsWith('$2b$');
            const status = isHashed ? '✅ HASHED' : '❌ PLAIN TEXT';
            console.log(`   ${user.name} (${user.email}): ${status}`);
            if (!isHashed) {
                console.log(`      Password: ${user.password}`);
            }
        });

        // Test password comparison for admin user
        const adminUser = users.find(user => user.role === 'admin');
        if (adminUser) {
            console.log('\n🔐 Testing Password Comparison:');
            const isCorrect = await adminUser.comparePassword('admin123');
            console.log(`   Admin password 'admin123' verification: ${isCorrect ? '✅ CORRECT' : '❌ FAILED'}`);
        }

        console.log('\n📊 Summary:');
        const hashedCount = users.filter(user => 
            user.password.startsWith('$2a$') || user.password.startsWith('$2b$')
        ).length;
        console.log(`   Total Users: ${users.length}`);
        console.log(`   Hashed Passwords: ${hashedCount}`);
        console.log(`   Plain Text Passwords: ${users.length - hashedCount}`);

        if (hashedCount === users.length) {
            console.log('\n✅ All passwords are properly hashed!');
        } else {
            console.log('\n⚠️  Some passwords are not hashed. Re-seeding recommended.');
        }

        process.exit(0);

    } catch (error) {
        console.error('❌ Error checking passwords:', error.message);
        process.exit(1);
    }
};

checkPasswords();