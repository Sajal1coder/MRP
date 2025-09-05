const express = require('express');
const { body, query } = require('express-validator');
const auth = require('../middleware/auth');
const {
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact
} = require('../controllers/contactController');

const router = express.Router();

// Get all contacts with search and filtering
router.get('/', auth, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().trim(),
  query('type').optional().isIn(['customer', 'vendor']).withMessage('Type must be customer or vendor')
], getAllContacts);

// Get single contact
router.get('/:id', auth, getContactById);

// Create new contact
router.post('/', auth, [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name is required and cannot exceed 100 characters'),
  body('phone')
    .trim()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Address cannot exceed 200 characters'),
  body('type')
    .isIn(['customer', 'vendor'])
    .withMessage('Type must be either customer or vendor')
], createContact);

// Update contact
router.put('/:id', auth, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  body('phone')
    .optional()
    .trim()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Address cannot exceed 200 characters'),
  body('type')
    .optional()
    .isIn(['customer', 'vendor'])
    .withMessage('Type must be either customer or vendor')
], updateContact);

// Delete contact
router.delete('/:id', auth, deleteContact);

module.exports = router;
