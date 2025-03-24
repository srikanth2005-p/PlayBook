const express = require('express');
const router = express.Router();
const { userRegisterValidation, loginValidation } = require('../utils/validation');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// Auth routes
router.post('/register', userRegisterValidation, userController.registerUser);
router.post('/login', loginValidation, userController.loginUser);

// Protected routes
router.get('/profile', auth, userController.getUserProfile);
router.put('/profile', auth, userController.updateUserProfile);
router.delete('/profile', auth, userController.deleteUserProfile);

module.exports = router;
