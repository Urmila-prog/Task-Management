require('dotenv').config();
const mongoose = require('mongoose');

const conn = async () => {
    try {
        const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/task_management';
        console.log('Attempting to connect to MongoDB...');
        console.log('MongoDB URI:', mongoURI.replace(/\/\/[^:]+:[^@]+@/, '//****:****@')); // Hide credentials in logs
        
        // Configure mongoose connection options
        const options = {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            autoIndex: true,
            maxPoolSize: 10,
            family: 4,
            retryWrites: true,
            retryReads: true,
            useNewUrlParser: true,
            useUnifiedTopology: true
        };

        // Set up connection event handlers
        mongoose.connection.on('connected', () => {
            console.log('MongoDB connected successfully');
            console.log('Connection state:', mongoose.connection.readyState);
        });

        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
            console.log('Connection state:', mongoose.connection.readyState);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected. Attempting to reconnect...');
            console.log('Connection state:', mongoose.connection.readyState);
            setTimeout(conn, 5000); // Retry connection after 5 seconds
        });

        // Handle application termination
        process.on('SIGINT', async () => {
            try {
                await mongoose.connection.close();
                console.log('MongoDB connection closed through app termination');
                process.exit(0);
            } catch (err) {
                console.error('Error during MongoDB disconnection:', err);
                process.exit(1);
            }
        });

        // Check if already connected
        if (mongoose.connection.readyState === 1) {
            console.log('Already connected to MongoDB');
            return;
        }
        
        await mongoose.connect(mongoURI, options);
        console.log('Connected to MongoDB successfully');
        console.log('Connection state:', mongoose.connection.readyState);
        
    } catch (err) {
        console.error('MongoDB connection error:', err);
        console.log('Connection state:', mongoose.connection.readyState);
        console.log('Retrying connection in 5 seconds...');
        setTimeout(conn, 5000); // Retry connection after 5 seconds
    }
};

// Initial connection
conn();

module.exports = conn;