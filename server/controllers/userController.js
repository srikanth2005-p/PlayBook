const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

// Register User
exports.registerUser = async (req, res) => {
    try {
        console.log('Registration request received:', {
            body: req.body
        });
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Validation errors:', errors.array());
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { fullName, email, phone, password, interests } = req.body;

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            console.log('User already exists:', email);
            return res.status(400).json({
                success: false,
                error: 'An account with this email already exists'
            });
        }

        // Create new user
        user = new User({
            fullName,
            email,
            phone,
            password,
            interests: interests || []
        });

        console.log('Attempting to save user:', user);
        await user.save();
        console.log('User saved successfully');

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Error in registerUser:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error registering user'
        });
    }
};

// Login User
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt for:', email);

        // Find user and include password
        const user = await User.findOne({ email }).select('+password');
        
        if (!user) {
            console.log('No user found with email:', email);
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        // Compare password
        const isMatch = await user.comparePassword(password);
        console.log('Password comparison result:', isMatch);

        if (!isMatch) {
            console.log('Password mismatch for user:', email);
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        // Create token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Send success response
        console.log('Login successful for user:', email);
        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                interests: user.interests
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'An error occurred during login'
        });
    }
};

// Get User Profile
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Error in getUserProfile:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching profile'
        });
    }
};

// Update User Profile
exports.updateUserProfile = async (req, res) => {
    try {
        const updates = {
            fullName: req.body.fullName,
            phone: req.body.phone,
            interests: req.body.interests
        };

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Error in updateUserProfile:', error);
        res.status(500).json({
            success: false,
            error: 'Error updating profile'
        });
    }
};

// Delete User Profile
exports.deleteUserProfile = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Error in deleteUserProfile:', error);
        res.status(500).json({
            success: false,
            error: 'Error deleting profile'
        });
    }
};
