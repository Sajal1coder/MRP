const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    required: [true, 'Transaction type is required'],
    enum: {
      values: ['sale', 'purchase'],
      message: 'Type must be either sale or purchase'
    }
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
    required: function() {
      return this.type === 'sale';
    }
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
    required: function() {
      return this.type === 'purchase';
    }
  },
  products: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product ID is required']
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1']
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    }
  }],
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  date: {
    type: Date,
    default: Date.now
  },
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Business ID is required']
  }
}, {
  timestamps: true
});

// Index for better query performance
transactionSchema.index({ businessId: 1, type: 1, date: -1 });
transactionSchema.index({ customerId: 1 });
transactionSchema.index({ vendorId: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
