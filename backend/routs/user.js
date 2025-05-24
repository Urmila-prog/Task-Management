const router = require('express').Router();
const mongoose = require('mongoose');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

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
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const existingUser = await User.findOne({ username });
    if (!existingUser) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: existingUser._id, username: existingUser.username },
      process.env.JWT_SECRET || 'tcmTM',
      { expiresIn: '2d' }
    );

    res.status(200).json({
      id: existingUser._id.toString(),
      token: token,
      username: existingUser.username,
      email: existingUser.email
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal server error' });
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

module.exports = router;