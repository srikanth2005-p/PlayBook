const { body } = require('express-validator');

// User registration validation
exports.userRegisterValidation = [
    body('fullName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Full name must be 2-50 characters long and contain only letters'),
    
    body('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Please enter a valid email address'),
    
    body('phone')
        .trim()
        .matches(/^[0-9]{10}$/)
        .withMessage('Please enter a valid 10-digit phone number'),
    
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    
    body('interests')
        .isArray()
        .withMessage('Please select at least one interest')
        .custom((value) => {
            const validInterests = ['cricket', 'football', 'badminton', 'basketball', 'tennis', 'swimming', 'other'];
            return value.every(interest => validInterests.includes(interest));
        })
        .withMessage('Please select valid interests')
];

// Owner registration validation
exports.ownerRegisterValidation = [
    body('fullName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Full name must be 2-50 characters long and contain only letters'),
    
    body('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Please enter a valid email address'),
    
    body('phone')
        .trim()
        .matches(/^[0-9]{10}$/)
        .withMessage('Please enter a valid 10-digit phone number'),
    
    body('password')
        .isLength({ min: 8 })
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        .withMessage('Password must be at least 8 characters long and contain uppercase, lowercase, number and special character'),
    
    body('businessName')
        .trim()
        .isLength({ min: 2, max: 100 })
        .matches(/^[\w\s&'-]+$/)
        .withMessage('Business name must be 2-100 characters long'),
    
    body('venueType')
        .trim()
        .isIn(['cricket', 'football', 'badminton', 'basketball', 'tennis', 'swimming', 'other'])
        .withMessage('Please select a valid venue type'),
    
    body('address')
        .trim()
        .isLength({ min: 10, max: 500 })
        .withMessage('Address must be 10-500 characters long')
];

// Login validation (shared between users and owners)
exports.loginValidation = [
    body('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Please enter a valid email address'),
    
    body('password')
        .exists()
        .withMessage('Password is required')
];
