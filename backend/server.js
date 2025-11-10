const dotenv = require('dotenv');

// Load env before importing app/routes so credentialed services initialize correctly
dotenv.config({ path: './config/.env' });

const app = require('./app');
const connectDatabase = require('./config/database');
const { verifyServices } = require('./utils/serviceVerification');

// Handle uncaught exceptions
process.on('uncaughtException', err => {
    console.log(`ERROR: ${err.message}`);
    console.log('Shutting down due to uncaught exception');
    process.exit(1);
});

// Env already loaded above

// Connecting to database
connectDatabase();

const server = app.listen(process.env.PORT, async () => {
    console.log(`Server started on port: ${process.env.PORT} in ${process.env.NODE_ENV} mode`);
    
    // Verify all service connections
    await verifyServices();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', err => {
    console.log(`ERROR: ${err.message}`);
    console.log('Shutting down the server due to Unhandled Promise rejection');
    server.close(() => {
        process.exit(1);
    });
});