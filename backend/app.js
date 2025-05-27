const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
require('./conn/conn');

// Middleware
app.use(cors());  // Allow all origins during development
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const UserAPI = require('./routs/user');
const TaskAPI = require('./routs/task');

// Log all requests
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    console.log('Request headers:', req.headers);
    next();
});

// API routes
app.use('/api/v1', UserAPI);
app.use('/api/v2', TaskAPI);

// Health check endpoint
app.get('/health', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    res.json({ 
        status: 'ok',
        timestamp: new Date().toISOString(),
        mongodb: dbStatus,
        uptime: process.uptime()
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
        method: req.method
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const port = process.env.PORT || 1000;

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

const server = app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
    console.log(`API endpoints available at:`);
    console.log(`- http://localhost:${port}/api/v1/signup`);
    console.log(`- http://localhost:${port}/api/v1/login`);
    console.log(`- http://localhost:${port}/health`);
});