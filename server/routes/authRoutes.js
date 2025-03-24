const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Owner = require('../models/Owner');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your-secret-key'; // In production, use environment variable

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

// User Profile Route
router.get('/user-profile', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Owner Profile Route
router.get('/owner-profile', verifyToken, async (req, res) => {
    try {
        const owner = await Owner.findById(req.user.id).select('-password');
        if (!owner) {
            return res.status(404).json({ message: 'Owner not found' });
        }
        res.json(owner);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// User Signout Route
router.post('/user-signout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Signed out successfully' });
});

// Owner Signout Route
router.post('/owner-signout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Signed out successfully' });
});

module.exports = router;
