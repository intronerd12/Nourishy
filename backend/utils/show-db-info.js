const mongoose = require('mongoose');
const connectDatabase = require('../config/database');
const dotenv = require('dotenv');

// Setting dotenv file
dotenv.config({ path: './config/.env' });

const showDatabaseInfo = async () => {
    try {
        // Connect to database
        connectDatabase();

        // Wait for connection
        await new Promise(resolve => setTimeout(resolve, 2000));

        console.log('\n🔍 MongoDB Connection Information:\n');
        
        // Show connection details
        const connection = mongoose.connection;
        console.log(`📍 Database Host: ${connection.host}`);
        console.log(`📂 Database Name: ${connection.name}`);
        console.log(`🔗 Connection URI: ${process.env.MONGO_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
        console.log(`⚡ Connection State: ${connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);

        // List all collections
        const collections = await connection.db.listCollections().toArray();
        console.log('\n📋 Available Collections:');
        collections.forEach(collection => {
            console.log(`   - ${collection.name}`);
        });

        // Show collection stats
        console.log('\n📊 Collection Statistics:');
        for (const collection of collections) {
            const count = await connection.db.collection(collection.name).countDocuments();
            console.log(`   ${collection.name}: ${count} documents`);
        }

        console.log('\n✅ To view this data in MongoDB Cloud:');
        console.log(`   1. Go to MongoDB Atlas Dashboard`);
        console.log(`   2. Select your cluster: Cluster0`);
        console.log(`   3. Click "Browse Collections"`);
        console.log(`   4. Look for database: "${connection.name}"`);
        console.log(`   5. Check collections: users, products`);

        process.exit(0);

    } catch (error) {
        console.error('❌ Error getting database info:', error.message);
        process.exit(1);
    }
};

showDatabaseInfo();