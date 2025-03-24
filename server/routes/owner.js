const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const auth = require('../middleware/auth');
const { ownerRegisterValidation, loginValidation } = require('../utils/validation');
const ownerController = require('../controllers/ownerController');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads');
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniquePrefix = uuidv4();
        const extension = path.extname(file.originalname);
        cb(null, uniquePrefix + extension);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG and PDF are allowed.'), false);
    }
};

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter
});

// Handle file upload errors
const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                error: 'File size too large. Maximum size is 5MB.'
            });
        }
        return res.status(400).json({
            success: false,
            error: err.message
        });
    }
    if (err) {
        return res.status(400).json({
            success: false,
            error: err.message
        });
    }
    next();
};

// Routes
router.post('/register', 
    upload.fields([
        { name: 'idProof', maxCount: 1 },
        { name: 'businessProof', maxCount: 1 }
    ]),
    handleUploadError,
    ownerRegisterValidation,
    ownerController.registerOwner
);

router.post('/login',
    loginValidation,
    ownerController.loginOwner
);

router.get('/profile', 
    auth,
    ownerController.getOwnerProfile
);

router.put('/profile', 
    auth,
    ownerController.updateOwnerProfile
);

router.delete('/profile', 
    auth,
    ownerController.deleteOwnerProfile
);

// Handle file upload
router.post('/upload-file', auth, upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: 'No file uploaded'
            });
        }

        res.json({
            success: true,
            file: {
                name: req.file.originalname,
                path: req.file.path,
                size: req.file.size,
                mimetype: req.file.mimetype
            }
        });
    } catch (error) {
        res.status(500).json({
            error: 'Server error while uploading file'
        });
    }
});

// Check email availability
router.get('/validate-email', async (req, res) => {
    try {
        const { email } = req.query;
        
        // TODO: Replace with your database query
        const existingUser = await db.owners.findOne({ email });
        
        res.json({
            available: !existingUser,
            message: existingUser ? 'Email is already registered' : 'Email is available'
        });
    } catch (error) {
        res.status(500).json({
            error: 'Server error while validating email'
        });
    }
});

module.exports = router;
