const express = require('express');
const { query } = require('express-validator');
const auth = require('../middleware/auth');
const {
  getInventoryReport,
  getTransactionReport,
  getDashboardSummary
} = require('../controllers/reportController');

const router = express.Router();

// Get inventory report
router.get('/inventory', auth, [
  query('lowStock').optional().isInt({ min: 0 }).withMessage('Low stock threshold must be a non-negative integer'),
  query('category').optional().trim(),
  query('sortBy').optional().isIn(['name', 'stock', 'price', 'category']).withMessage('Sort by must be name, stock, price, or category'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
], getInventoryReport);

// Get transaction reports
router.get('/transactions', auth, [
  query('startDate').optional().isISO8601().withMessage('Start date must be a valid date'),
  query('endDate').optional().isISO8601().withMessage('End date must be a valid date'),
  query('type').optional().isIn(['sale', 'purchase']).withMessage('Type must be sale or purchase'),
  query('period').optional().isIn(['today', 'week', 'month', 'year']).withMessage('Period must be today, week, month, or year')
], getTransactionReport);

// Get dashboard summary
router.get('/dashboard', auth, getDashboardSummary);

module.exports = router;
