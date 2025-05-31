const router = require('express').Router();
const mongoose = require('mongoose');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client('525169556176-jfo2jpkugogi7p313du4ftd4uf15hjm5.apps.googleusercontent.com');

// Test route to verify route registration
router.get('/test', (req, res) => {
    res.json({ message: 'Test route working' });
});

// Ensure MongoDB connection is established
if (mongoose.connection.readyState === 0) {
  mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/task_management', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => {
    console.log('MongoDB connected');
  }).catch((err) => {
    console.error('MongoDB connection error:', err);
  });
}

router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check for missing fields 
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }

    const existingUser = await User.findOne({ username });
    const existingEmail = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    } else if (username.length < 4) {
      return res.status(400).json({ message: 'Username should have at least 4 characters' });
    }
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });
    await newUser.save();
    return res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// login
router.post('/login', async (req, res) => {
  console.log('Login route hit with body:', req.body);
  console.log('Request URL:', req.originalUrl);
  console.log('Request method:', req.method);
  
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      console.log('Missing credentials:', { username: !!username, password: !!password });
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      console.log('MongoDB not connected. Current state:', mongoose.connection.readyState);
      try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/task_management', {
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
        });
        console.log('MongoDB reconnected successfully');
      } catch (err) {
        console.error('Failed to connect to MongoDB:', err);
        return res.status(503).json({ 
          message: 'Database connection error. Please try again in a few moments.',
          error: 'DATABASE_CONNECTION_ERROR'
        });
      }
    }

    console.log('Searching for user:', username);
    const existingUser = await User.findOne({ username }).maxTimeMS(5000);
    console.log('User found:', existingUser ? 'Yes' : 'No');
    
    if (!existingUser) {
      console.log('No user found with username:', username);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, existingUser.password);
    console.log('Password validation result:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('Invalid password for user:', username);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: existingUser._id, username: existingUser.username },
      process.env.JWT_SECRET || 'tcmTM',
      { expiresIn: '2d' }
    );

    console.log('Login successful for user:', username);
    res.status(200).json({
      id: existingUser._id.toString(),
      token: token,
      username: existingUser.username,
      email: existingUser.email
    });
  } catch (err) {
    console.error('Login error:', err);
    
    if (err.name === 'MongooseError' && err.message.includes('buffering timed out')) {
      return res.status(503).json({ 
        message: 'Database connection timeout. Please try again.',
        error: 'DATABASE_TIMEOUT'
      });
    }
    
    res.status(500).json({ 
      message: 'An error occurred during login. Please try again.',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
});

// Get user details
router.get('/user/:id', async (req, res) => {
  try {
    console.log('Fetching user with ID:', req.params.id);
    const user = await User.findById(req.params.id).select('-password');
    console.log('Found user:', user);
    
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Google login endpoint
router.post('/google-login', async (req, res) => {
    console.log('Google login route hit');
    console.log('Request body:', req.body);
    
    try {
        const { credential } = req.body;
        
        if (!credential) {
            console.log('No credential provided in request');
            return res.status(400).json({ message: 'No credential provided' });
        }

        console.log('Verifying Google token...');
        // Verify the Google token
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: '525169556176-jfo2jpkugogi7p313du4ftd4uf15hjm5.apps.googleusercontent.com'
        });

        const payload = ticket.getPayload();
        console.log('Google token verified, payload:', { email: payload.email, name: payload.name });
        const { email, name, picture } = payload;

        // Check if user exists
        let user = await User.findOne({ email });
        console.log('Existing user found:', !!user);

        if (!user) {
            console.log('Creating new user for Google login');
            // Create new user if doesn't exist
            user = new User({
                username: name,
                email: email,
                password: await bcrypt.hash(Math.random().toString(36), 10), // Random password for Google users
                profilePicture: picture
            });
            await user.save();
            console.log('New user created successfully');
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET || 'tcmTM',
            { expiresIn: '2d' }
        );

        console.log('Login successful, sending response');
        res.status(200).json({
            id: user._id.toString(),
            token: token,
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture
        });
    } catch (error) {
        console.error('Google login error:', error);
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Google token expired' });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid Google token' });
        }
        
        res.status(500).json({ 
            message: 'An error occurred during Google login',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

router.get('/simple-test', (req, res) => {
  res.json({ message: 'Simple test route working' });
});

module.exports = router;