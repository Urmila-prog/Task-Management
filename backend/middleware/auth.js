const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'tcmTM');
        req.user = verified;  // Store the entire verified user object
        next();
    } catch (err) {
        console.error('Token verification error:', err);
        res.status(403).json({ message: 'Invalid token' });
    }
};

module.exports = { authenticateToken }; 