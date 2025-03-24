const Owner = require('../models/Owner');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const path = require('path');

// Register Owner
exports.registerOwner = async (req, res) => {
    try {
        console.log('Registration request received:', {
            body: req.body,
            files: req.files
        });
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Validation errors:', errors.array());
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { 
            fullName, 
            email, 
            phone, 
            password,
            confirmPassword, 
            businessName, 
            venueType, 
            address 
        } = req.body;

        // Validate password match
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                error: 'Passwords do not match'
            });
        }

        // Check if owner already exists
        let owner = await Owner.findOne({ email });
        if (owner) {
            console.log('Owner already exists:', email);
            return res.status(400).json({
                success: false,
                error: 'An account with this email already exists'
            });
        }

        // Check if phone number is already in use
        owner = await Owner.findOne({ phone });
        if (owner) {
            console.log('Phone number already in use:', phone);
            return res.status(400).json({
                success: false,
                error: 'This phone number is already registered'
            });
        }

        // Create new owner
        owner = new Owner({
            fullName,
            email,
            phone,
            password, // Password will be hashed by the pre-save middleware
            businessName,
            venueType,
            address
        });

        console.log('Attempting to save owner:', owner);
        await owner.save();
        console.log('Owner saved successfully');

        // Generate JWT token
        const token = jwt.sign(
            { id: owner._id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(201).json({
            success: true,
            token,
            owner: {
                id: owner._id,
                fullName: owner.fullName,
                email: owner.email,
                businessName: owner.businessName
            }
        });
    } catch (error) {
        console.error('Error in registerOwner:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error registering owner'
        });
    }
};

// Login Owner
exports.loginOwner = async (req, res) => {
    try {
        console.log('Login attempt for:', req.body.email);
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        // Check if owner exists
        const owner = await Owner.findOne({ email }).select('+password');
        if (!owner) {
            console.log('No owner found with email:', email);
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        // Check password
        const isMatch = await owner.comparePassword(password);
        if (!isMatch) {
            console.log('Invalid password for owner:', email);
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        // Create token
        const token = jwt.sign(
            { id: owner._id },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        console.log('Owner logged in successfully:', email);
        res.json({
            success: true,
            token,
            owner: {
                id: owner._id,
                fullName: owner.fullName,
                email: owner.email,
                businessName: owner.businessName
            }
        });

    } catch (err) {
        console.error('Error in loginOwner:', err);
        res.status(500).json({
            success: false,
            error: 'Login failed. Please try again.'
        });
    }
};

// Get Owner Profile
exports.getOwnerProfile = async (req, res) => {
    try {
        const owner = await Owner.findById(req.owner.id);
        if (!owner) {
            return res.status(404).json({
                success: false,
                error: 'Owner not found'
            });
        }

        res.json({
            success: true,
            owner: {
                id: owner._id,
                fullName: owner.fullName,
                email: owner.email,
                phone: owner.phone,
                businessName: owner.businessName,
                venueType: owner.venueType,
                address: owner.address
            }
        });

    } catch (err) {
        console.error('Error in getOwnerProfile:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch profile'
        });
    }
};

// Update Owner Profile
exports.updateOwnerProfile = async (req, res) => {
    try {
        const updates = req.body;
        const owner = await Owner.findById(req.owner.id);

        if (!owner) {
            return res.status(404).json({
                success: false,
                error: 'Owner not found'
            });
        }

        // Update allowed fields
        const allowedUpdates = ['fullName', 'phone', 'businessName', 'venueType', 'address'];
        Object.keys(updates).forEach(update => {
            if (allowedUpdates.includes(update)) {
                owner[update] = updates[update];
            }
        });

        await owner.save();

        res.json({
            success: true,
            owner: {
                id: owner._id,
                fullName: owner.fullName,
                email: owner.email,
                phone: owner.phone,
                businessName: owner.businessName,
                venueType: owner.venueType,
                address: owner.address
            }
        });

    } catch (err) {
        console.error('Error in updateOwnerProfile:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to update profile'
        });
    }
};

// Delete Owner Profile
exports.deleteOwnerProfile = async (req, res) => {
    try {
        const owner = await Owner.findById(req.owner.id);
        
        if (!owner) {
            return res.status(404).json({
                success: false,
                error: 'Owner not found'
            });
        }

        await owner.remove();

        res.json({
            success: true,
            message: 'Owner profile deleted successfully'
        });

    } catch (err) {
        console.error('Error in deleteOwnerProfile:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to delete profile'
        });
    }
};
