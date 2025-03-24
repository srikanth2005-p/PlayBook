const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ownerSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Please provide your full name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: [true, 'Please provide your phone number']
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false
    },
    businessName: {
        type: String,
        required: [true, 'Please provide your business name'],
        trim: true
    },
    venueType: {
        type: String,
        required: [true, 'Please provide venue type'],
        enum: ['cricket', 'football', 'badminton', 'basketball', 'tennis', 'swimming', 'other']
    },
    address: {
        type: String,
        required: [true, 'Please provide venue address'],
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Create indexes
ownerSchema.index({ email: 1 }, { unique: true });
ownerSchema.index({ phone: 1 }, { unique: true });
ownerSchema.index({ businessName: 'text', address: 'text' });

// Hash password before saving
ownerSchema.pre('save', async function(next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
ownerSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error('Error comparing passwords');
    }
};

module.exports = mongoose.model('Owner', ownerSchema);
