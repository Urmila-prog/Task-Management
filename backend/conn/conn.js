const mongoose = require('mongoose');
require('dotenv').config();

const conn = async () => {
    try {
        console.log('Current directory:', __dirname);
        console.log('Environment variables:', process.env);
        console.log('MongoDB URI:', process.env.MONGO_URI);
        
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in environment variables');
        }

        const response = await mongoose.connect(process.env.MONGO_URI);
        if (response) {
            console.log('Connected to MongoDB successfully');
        }
    } catch (err) {
        console.log('MongoDB connection error:', err);
        process.exit(1);
    }
};

conn();
module.exports = conn;