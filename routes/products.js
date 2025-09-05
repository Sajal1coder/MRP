const express = require('express');
const { body, query, param } = require('express-validator');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock
} = require('../controllers/productController');

const router = express.Router();

// Get all products with search and pagination
router.get('/', auth, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().trim(),
  query('category').optional().trim()
], getAllProducts);

// Validate MongoDB ObjectId
const validateObjectId = [
  param('id')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid product ID')
];

// Get single product
router.get('/:id', auth, validateObjectId, getProductById);

// Create new product
router.post('/', auth, [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Product name is required and cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('price')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('stock')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  body('category')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Category is required and cannot exceed 50 characters')
], createProduct);

// Update product
router.put('/:id', auth, validateObjectId, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Product name cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('price')
    .optional()
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  body('category')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Category cannot exceed 50 characters')
], updateProduct);

// Delete product
router.delete('/:id', auth, validateObjectId, deleteProduct);

// Update stock (increase/decrease)
router.patch('/:id/stock', auth, validateObjectId, [
  body('action')
    .isIn(['increase', 'decrease'])
    .withMessage('Action must be either increase or decrease'),
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer')
], updateStock);

module.exports = router;
