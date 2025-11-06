const { cloudinary, configureCloudinary } = require('../config/cloudinary');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');

// Verify all services connection
const verifyServices = async () => {
    console.log('\n🔍 Verifying service connections...\n');
    
    const results = {
        mongodb: { status: '❌', message: 'Not connected' },
        cloudinary: { status: '❌', message: 'Not connected' },
        mailtrap: { status: '❌', message: 'Not connected' }
    };

    // Check MongoDB connection
    try {
        // Wait for connection to be established if needed
        let attempts = 0;
        while (mongoose.connection.readyState !== 1 && attempts < 10) {
            await new Promise(resolve => setTimeout(resolve, 200));
            attempts++;
        }
        
        if (mongoose.connection.readyState === 1) {
            results.mongodb.status = '✅';
            results.mongodb.message = `Connected to ${mongoose.connection.host}`;
        } else {
            results.mongodb.message = `Connection state: ${mongoose.connection.readyState}`;
        }
    } catch (error) {
        results.mongodb.message = `Error: ${error.message}`;
    }

    // Check Cloudinary connection
    try {
        configureCloudinary();
        await cloudinary.api.ping();
        results.cloudinary.status = '✅';
        results.cloudinary.message = `Connected (Cloud: ${process.env.CLOUDINARY_CLOUD_NAME})`;
    } catch (error) {
        results.cloudinary.message = `Error: ${error.message}`;
    }

    // Check Mailtrap/Email service
    try {
        // Just verify the connection configuration without sending an actual email
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD
            }
        });
        
        // Verify the connection configuration
        await transporter.verify();
        results.mailtrap.status = '✅';
        results.mailtrap.message = `Connected (Host: ${process.env.SMTP_HOST})`;
    } catch (error) {
        if (error.message.includes('Missing credentials')) {
            results.mailtrap.message = 'Missing SMTP credentials in environment';
        } else {
            results.mailtrap.message = `Error: ${error.message}`;
        }
    }

    // Display results
    console.log('📊 Service Connection Status:');
    console.log(`   MongoDB:    ${results.mongodb.status} ${results.mongodb.message}`);
    console.log(`   Cloudinary: ${results.cloudinary.status} ${results.cloudinary.message}`);
    console.log(`   Mailtrap:   ${results.mailtrap.status} ${results.mailtrap.message}`);
    console.log('\n' + '='.repeat(60) + '\n');
    
    return results;
};

module.exports = { verifyServices };