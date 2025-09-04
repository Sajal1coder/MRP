const { validationResult } = require('express-validator');
const Product = require('../models/Product');
const Transaction = require('../models/Transaction');
const Contact = require('../models/Contact');

// Get inventory report
const getInventoryReport = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { lowStock, category, sortBy = 'name', sortOrder = 'asc' } = req.query;
    const lowStockThreshold = parseInt(lowStock) || 10;

    // Build query
    let query = { businessId: req.user._id };
    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const products = await Product.find(query).sort(sortObj);

    // Calculate inventory statistics
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, product) => sum + (product.price * product.stock), 0);
    const lowStockProducts = products.filter(product => product.stock <= lowStockThreshold);
    const outOfStockProducts = products.filter(product => product.stock === 0);

    // Group by category
    const categoryStats = products.reduce((acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = {
          count: 0,
          totalStock: 0,
          totalValue: 0
        };
      }
      acc[product.category].count++;
      acc[product.category].totalStock += product.stock;
      acc[product.category].totalValue += product.price * product.stock;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        summary: {
          totalProducts,
          totalValue: parseFloat(totalValue.toFixed(2)),
          lowStockCount: lowStockProducts.length,
          outOfStockCount: outOfStockProducts.length,
          lowStockThreshold
        },
        products,
        lowStockProducts,
        outOfStockProducts,
        categoryStats
      }
    });
  } catch (error) {
    console.error('Inventory report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error generating inventory report'
    });
  }
};

// Get transaction reports
const getTransactionReport = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    let { startDate, endDate, type, period } = req.query;

    // Handle predefined periods
    if (period) {
      const now = new Date();
      switch (period) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
          break;
        case 'week':
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          weekStart.setHours(0, 0, 0, 0);
          startDate = weekStart;
          endDate = new Date(weekStart);
          endDate.setDate(weekStart.getDate() + 7);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          endDate = new Date(now.getFullYear() + 1, 0, 1);
          break;
      }
    }

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
      .populate('customerId', 'name')
      .populate('vendorId', 'name')
      .populate('products.productId', 'name category')
      .sort({ date: -1 });

    // Calculate statistics
    const totalTransactions = transactions.length;
    const salesTransactions = transactions.filter(t => t.type === 'sale');
    const purchaseTransactions = transactions.filter(t => t.type === 'purchase');
    
    const totalSales = salesTransactions.reduce((sum, t) => sum + t.totalAmount, 0);
    const totalPurchases = purchaseTransactions.reduce((sum, t) => sum + t.totalAmount, 0);
    const netProfit = totalSales - totalPurchases;

    // Top customers and vendors
    const customerStats = {};
    const vendorStats = {};

    salesTransactions.forEach(transaction => {
      if (transaction.customerId) {
        const customerId = transaction.customerId._id.toString();
        if (!customerStats[customerId]) {
          customerStats[customerId] = {
            name: transaction.customerId.name,
            totalAmount: 0,
            transactionCount: 0
          };
        }
        customerStats[customerId].totalAmount += transaction.totalAmount;
        customerStats[customerId].transactionCount++;
      }
    });

    purchaseTransactions.forEach(transaction => {
      if (transaction.vendorId) {
        const vendorId = transaction.vendorId._id.toString();
        if (!vendorStats[vendorId]) {
          vendorStats[vendorId] = {
            name: transaction.vendorId.name,
            totalAmount: 0,
            transactionCount: 0
          };
        }
        vendorStats[vendorId].totalAmount += transaction.totalAmount;
        vendorStats[vendorId].transactionCount++;
      }
    });

    // Sort and get top 5
    const topCustomers = Object.values(customerStats)
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 5);

    const topVendors = Object.values(vendorStats)
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 5);

    res.json({
      success: true,
      data: {
        summary: {
          totalTransactions,
          salesCount: salesTransactions.length,
          purchasesCount: purchaseTransactions.length,
          totalSales: parseFloat(totalSales.toFixed(2)),
          totalPurchases: parseFloat(totalPurchases.toFixed(2)),
          netProfit: parseFloat(netProfit.toFixed(2)),
          period: period || 'custom',
          dateRange: {
            startDate: startDate || null,
            endDate: endDate || null
          }
        },
        transactions,
        topCustomers,
        topVendors
      }
    });
  } catch (error) {
    console.error('Transaction report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error generating transaction report'
    });
  }
};

// Get dashboard summary
const getDashboardSummary = async (req, res) => {
  try {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Get counts
    const [
      totalProducts,
      totalCustomers,
      totalVendors,
      todayTransactions,
      monthTransactions,
      lowStockProducts
    ] = await Promise.all([
      Product.countDocuments({ businessId: req.user._id }),
      Contact.countDocuments({ businessId: req.user._id, type: 'customer' }),
      Contact.countDocuments({ businessId: req.user._id, type: 'vendor' }),
      Transaction.find({ businessId: req.user._id, date: { $gte: startOfToday } }),
      Transaction.find({ businessId: req.user._id, date: { $gte: startOfMonth } }),
      Product.find({ businessId: req.user._id, stock: { $lte: 10 } })
    ]);

    // Calculate today's stats
    const todaySales = todayTransactions
      .filter(t => t.type === 'sale')
      .reduce((sum, t) => sum + t.totalAmount, 0);

    const todayPurchases = todayTransactions
      .filter(t => t.type === 'purchase')
      .reduce((sum, t) => sum + t.totalAmount, 0);

    // Calculate month's stats
    const monthSales = monthTransactions
      .filter(t => t.type === 'sale')
      .reduce((sum, t) => sum + t.totalAmount, 0);

    const monthPurchases = monthTransactions
      .filter(t => t.type === 'purchase')
      .reduce((sum, t) => sum + t.totalAmount, 0);

    res.json({
      success: true,
      data: {
        overview: {
          totalProducts,
          totalCustomers,
          totalVendors,
          lowStockCount: lowStockProducts.length
        },
        today: {
          sales: parseFloat(todaySales.toFixed(2)),
          purchases: parseFloat(todayPurchases.toFixed(2)),
          transactionCount: todayTransactions.length
        },
        thisMonth: {
          sales: parseFloat(monthSales.toFixed(2)),
          purchases: parseFloat(monthPurchases.toFixed(2)),
          profit: parseFloat((monthSales - monthPurchases).toFixed(2)),
          transactionCount: monthTransactions.length
        },
        alerts: {
          lowStockProducts: lowStockProducts.map(p => ({
            id: p._id,
            name: p.name,
            stock: p.stock,
            category: p.category
          }))
        }
      }
    });
  } catch (error) {
    console.error('Dashboard report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error generating dashboard report'
    });
  }
};

module.exports = {
  getInventoryReport,
  getTransactionReport,
  getDashboardSummary
};
