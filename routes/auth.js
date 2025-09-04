const express = require('express');
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const {
  register,
  login,
  getProfile,
  logout
} = require('../controllers/authController');

const router = express.Router();

// Register new user
router.post('/register', [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('businessName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Business name is required and cannot exceed 100 characters')
], register);

// Login user
router.post('/login', [
  body('login')
    .trim()
    .notEmpty()
    .withMessage('Username or email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], login);

// Get current user profile
router.get('/profile', auth, getProfile);

// Logout (client-side token removal)
router.post('/logout', auth, logout);

module.exports = router;
