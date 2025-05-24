const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const app = express();
const cors = require('cors');
require('./conn/conn');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const UserAPI = require('./routs/user');
const TaskAPI = require('./routs/task');

// Log all requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// API routes
app.use('/api/v1', UserAPI);
app.use('/api/v2', TaskAPI);

// Default route
app.get('/', (req, res) => {
    res.json({ message: 'hello from backend side' });
});

// 404 handler
app.use((req, res, next) => {
    res.status(404).json({ message: `Route ${req.url} not found` });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const port = 1000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`API endpoints available at:`);
    console.log(`- http://localhost:${port}/api/v1/signup`);
    console.log(`- http://localhost:${port}/api/v1/login`);
});