const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');

// Debug environment variables
console.log('=== Environment Debug ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('GOOGLE_AI_API_KEY exists:', !!process.env.GOOGLE_AI_API_KEY);
console.log('GOOGLE_AI_API_KEY length:', process.env.GOOGLE_AI_API_KEY ? process.env.GOOGLE_AI_API_KEY.length : 0);
console.log('MONGO_URI exists:', !!process.env.MONGO_URI);
console.log('All env keys:', Object.keys(process.env).filter(key => key.includes('GOOGLE') || key.includes('MONGO')));
console.log('=========================');

// Validate required environment variables
if (!process.env.GOOGLE_AI_API_KEY) {
    console.error('GOOGLE_AI_API_KEY is not set in environment variables');
    process.exit(1);
}

// MongoDB connection setup
mongoose.connection.on('connected', () => {
    console.log('MongoDB connected successfully');
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

// Connect to MongoDB
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/task_management';
        console.log('Attempting to connect to MongoDB...');
        
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        
        console.log('MongoDB connected successfully');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
};

connectDB();

// CORS configuration
const corsOptions = {
    origin: '*',  // Allow all origins during development
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const UserAPI = require('./routs/user');
const TaskAPI = require('./routs/task');
const TestAPI = require('./routs/test');

// Log all requests
app.use((req, res, next) => {
    console.log('----------------------------------------');
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);
    console.log('----------------------------------------');
    next();
});

// Create server instance
const server = app.listen(process.env.PORT || 1000, '0.0.0.0', () => {
    console.log(`Server is running on port ${process.env.PORT || 1000}`);
    console.log(`API endpoints available at:`);
    console.log(`- http://localhost:${process.env.PORT || 1000}/api/v1/user/login`);
    console.log(`- http://localhost:${process.env.PORT || 1000}/api/v1/user/signup`);
    console.log(`- http://localhost:${process.env.PORT || 1000}/health`);
});

// Handle server shutdown gracefully
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        mongoose.connection.close(false, () => {
            console.log('MongoDB connection closed');
            process.exit(0);
        });
    });
});

// Test route in app.js
app.get('/api/v1/test', (req, res) => {
    console.log('Test route accessed');
    res.json({ message: 'App.js test route working' });
});

// API routes - Mount routes before any other routes
console.log('Registering API routes...');
app.use('/api/v1/user', (req, res, next) => {
    console.log('User API route accessed:', req.method, req.url);
    next();
}, UserAPI);

app.use('/api/v2', (req, res, next) => {
    console.log('Task API route accessed:', req.method, req.url);
    next();
}, TaskAPI);

// Test routes without authentication
app.use('/api/test', (req, res, next) => {
    console.log('Test API route accessed:', req.method, req.url);
    next();
}, TestAPI);

// Health check endpoint
app.get('/health', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    res.json({ 
        status: 'ok',
        timestamp: new Date().toISOString(),
        mongodb: dbStatus,
        uptime: process.uptime(),
        routes: {
            user: '/api/v1/user',
            tasks: '/api/v2'
        }
    });
});

// Default route
app.get('/', (req, res) => {
    res.json({ 
        message: 'Task Management API',
        version: '1.0.0',
        status: 'running',
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// 404 handler
app.use((req, res, next) => {
    console.log(`404 - Route not found: ${req.method} ${req.url}`);
    res.status(404).json({ 
        message: `Route ${req.url} not found`,
        method: req.method,
        availableRoutes: {
            user: '/api/v1/user',
            tasks: '/api/v2',
            health: '/health'
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        name: err.name,
        path: req.url,
        method: req.method
    });
    
    res.status(500).json({ 
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? {
            message: err.message,
            stack: err.stack,
            name: err.name
        } : undefined,
        path: req.url,
        method: req.method
    });
});