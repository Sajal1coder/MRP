const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Transaction = require('../models/Transaction');
const Product = require('../models/Product');
const Contact = require('../models/Contact');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');

const router = express.Router();

// Get all transactions with filtering
router.get('/', auth, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('type').optional().isIn(['sale', 'purchase']).withMessage('Type must be sale or purchase'),
  query('startDate').optional().isISO8601().withMessage('Start date must be a valid date'),
  query('endDate').optional().isISO8601().withMessage('End date must be a valid date')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { type, startDate, endDate } = req.query;

    // Build query
    let query = { businessId: req.user._id };

    if (type) {
      query.type = type;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query)
      .populate('customerId', 'name phone email')
      .populate('vendorId', 'name phone email')
      .populate('products.productId', 'name category')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Transaction.countDocuments(query);

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching transactions'
    });
  }
});

// Get single transaction
router.get('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      businessId: req.user._id
    })
      .populate('customerId', 'name phone email')
      .populate('vendorId', 'name phone email')
      .populate('products.productId', 'name category price');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      data: { transaction }
    });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching transaction'
    });
  }
});

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
], async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { type, customerId, vendorId, products } = req.body;

    // Validate contact based on transaction type
    if (type === 'sale' && !customerId) {
      return res.status(400).json({
        success: false,
        message: 'Customer ID is required for sales'
      });
    }

    if (type === 'purchase' && !vendorId) {
      return res.status(400).json({
        success: false,
        message: 'Vendor ID is required for purchases'
      });
    }

    // Verify contact exists and belongs to user
    if (customerId) {
      const customer = await Contact.findOne({
        _id: customerId,
        businessId: req.user._id,
        type: 'customer'
      });
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }
    }

    if (vendorId) {
      const vendor = await Contact.findOne({
        _id: vendorId,
        businessId: req.user._id,
        type: 'vendor'
      });
      if (!vendor) {
        return res.status(404).json({
          success: false,
          message: 'Vendor not found'
        });
      }
    }

    // Verify all products exist and belong to user
    const productIds = products.map(p => p.productId);
    const existingProducts = await Product.find({
      _id: { $in: productIds },
      businessId: req.user._id
    });

    if (existingProducts.length !== productIds.length) {
      return res.status(404).json({
        success: false,
        message: 'One or more products not found'
      });
    }

    // Check stock availability for sales
    if (type === 'sale') {
      for (const item of products) {
        const product = existingProducts.find(p => p._id.toString() === item.productId);
        if (product.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for product: ${product.name}. Available: ${product.stock}, Required: ${item.quantity}`
          });
        }
      }
    }

    // Calculate total amount
    const totalAmount = products.reduce((sum, item) => sum + (item.quantity * item.price), 0);

    // Create transaction
    const transaction = new Transaction({
      type,
      customerId: type === 'sale' ? customerId : undefined,
      vendorId: type === 'purchase' ? vendorId : undefined,
      products,
      totalAmount,
      businessId: req.user._id
    });

    await transaction.save({ session });

    // Update product stock
    for (const item of products) {
      const stockChange = type === 'sale' ? -item.quantity : item.quantity;
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: stockChange } },
        { session }
      );
    }

    await session.commitTransaction();

    // Populate the transaction for response
    await transaction.populate([
      { path: 'customerId', select: 'name phone email' },
      { path: 'vendorId', select: 'name phone email' },
      { path: 'products.productId', select: 'name category' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: { transaction }
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Create transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating transaction'
    });
  } finally {
    session.endSession();
  }
});

// Get transactions by contact (customer or vendor)
router.get('/contact/:contactId', auth, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { contactId } = req.params;

    // Verify contact exists and belongs to user
    const contact = await Contact.findOne({
      _id: contactId,
      businessId: req.user._id
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    // Build query based on contact type
    const query = {
      businessId: req.user._id,
      [contact.type === 'customer' ? 'customerId' : 'vendorId']: contactId
    };

    const transactions = await Transaction.find(query)
      .populate('products.productId', 'name category')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Transaction.countDocuments(query);

    res.json({
      success: true,
      data: {
        contact,
        transactions,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      }
    });
  } catch (error) {
    console.error('Get contact transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching contact transactions'
    });
  }
});

module.exports = router;
