const express = require('express');
const { body, query } = require('express-validator');
const auth = require('../middleware/auth');
const {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  getTransactionsByContact
} = require('../controllers/transactionController');

const router = express.Router();

// Get all transactions with filtering
router.get('/', auth, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('type').optional().isIn(['sale', 'purchase']).withMessage('Type must be sale or purchase'),
  query('startDate').optional().isISO8601().withMessage('Start date must be a valid date'),
  query('endDate').optional().isISO8601().withMessage('End date must be a valid date')
], getAllTransactions);

// Get single transaction
router.get('/:id', auth, getTransactionById);

// Create new transaction
router.post('/', auth, [
  body('type')
    .isIn(['sale', 'purchase'])
    .withMessage('Type must be either sale or purchase'),
  body('customerId')
    .optional()
    .isMongoId()
    .withMessage('Customer ID must be a valid MongoDB ObjectId'),
  body('vendorId')
    .optional()
    .isMongoId()
    .withMessage('Vendor ID must be a valid MongoDB ObjectId'),
  body('products')
    .isArray({ min: 1 })
    .withMessage('Products array is required and must contain at least one item'),
  body('products.*.productId')
    .isMongoId()
    .withMessage('Product ID must be a valid MongoDB ObjectId'),
  body('products.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  body('products.*.price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number')
], createTransaction);

// Get transactions by contact (customer or vendor)
router.get('/contact/:contactId', auth, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], getTransactionsByContact);

module.exports = router;
