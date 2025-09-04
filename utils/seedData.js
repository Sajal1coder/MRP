const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Product = require('../models/Product');
const Contact = require('../models/Contact');
const Transaction = require('../models/Transaction');

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Contact.deleteMany({});
    await Transaction.deleteMany({});

    // Create demo user
    const hashedPassword = await bcrypt.hash('demo123', 12);
    const demoUser = new User({
      username: 'demo_user',
      email: 'demo@example.com',
      password: hashedPassword,
      businessName: 'Demo Electronics Store'
    });
    await demoUser.save();
    console.log('✅ Demo user created');

    // Create demo products
    const products = [
      {
        name: 'iPhone 15 Pro',
        description: 'Latest Apple smartphone with advanced features',
        price: 999.99,
        stock: 25,
        category: 'Smartphones',
        businessId: demoUser._id
      },
      {
        name: 'Samsung Galaxy S24',
        description: 'Premium Android smartphone',
        price: 899.99,
        stock: 30,
        category: 'Smartphones',
        businessId: demoUser._id
      },
      {
        name: 'MacBook Pro 16"',
        description: 'High-performance laptop for professionals',
        price: 2499.99,
        stock: 15,
        category: 'Laptops',
        businessId: demoUser._id
      },
      {
        name: 'Dell XPS 13',
        description: 'Compact and powerful ultrabook',
        price: 1299.99,
        stock: 20,
        category: 'Laptops',
        businessId: demoUser._id
      },
      {
        name: 'iPad Air',
        description: 'Versatile tablet for work and entertainment',
        price: 599.99,
        stock: 40,
        category: 'Tablets',
        businessId: demoUser._id
      },
      {
        name: 'AirPods Pro',
        description: 'Wireless earbuds with noise cancellation',
        price: 249.99,
        stock: 50,
        category: 'Accessories',
        businessId: demoUser._id
      },
      {
        name: 'Sony WH-1000XM5',
        description: 'Premium noise-canceling headphones',
        price: 399.99,
        stock: 8,
        category: 'Accessories',
        businessId: demoUser._id
      },
      {
        name: 'Apple Watch Series 9',
        description: 'Advanced smartwatch with health features',
        price: 399.99,
        stock: 35,
        category: 'Wearables',
        businessId: demoUser._id
      },
      {
        name: 'Gaming Mouse',
        description: 'High-precision gaming mouse',
        price: 79.99,
        stock: 5,
        category: 'Accessories',
        businessId: demoUser._id
      },
      {
        name: 'Wireless Keyboard',
        description: 'Ergonomic wireless keyboard',
        price: 129.99,
        stock: 0,
        category: 'Accessories',
        businessId: demoUser._id
      }
    ];

    const createdProducts = await Product.insertMany(products);
    console.log('✅ Demo products created');

    // Create demo contacts (customers and vendors)
    const contacts = [
      // Customers
      {
        name: 'John Smith',
        phone: '+1234567890',
        email: 'john.smith@email.com',
        address: '123 Main St, New York, NY 10001',
        type: 'customer',
        businessId: demoUser._id
      },
      {
        name: 'Sarah Johnson',
        phone: '+1234567891',
        email: 'sarah.johnson@email.com',
        address: '456 Oak Ave, Los Angeles, CA 90210',
        type: 'customer',
        businessId: demoUser._id
      },
      {
        name: 'Mike Wilson',
        phone: '+1234567892',
        email: 'mike.wilson@email.com',
        address: '789 Pine St, Chicago, IL 60601',
        type: 'customer',
        businessId: demoUser._id
      },
      {
        name: 'Emily Davis',
        phone: '+1234567893',
        email: 'emily.davis@email.com',
        address: '321 Elm St, Houston, TX 77001',
        type: 'customer',
        businessId: demoUser._id
      },
      // Vendors
      {
        name: 'Apple Inc.',
        phone: '+1800275753',
        email: 'business@apple.com',
        address: 'One Apple Park Way, Cupertino, CA 95014',
        type: 'vendor',
        businessId: demoUser._id
      },
      {
        name: 'Samsung Electronics',
        phone: '+1800726786',
        email: 'business@samsung.com',
        address: '85 Challenger Rd, Ridgefield Park, NJ 07660',
        type: 'vendor',
        businessId: demoUser._id
      },
      {
        name: 'Dell Technologies',
        phone: '+1800915335',
        email: 'business@dell.com',
        address: 'One Dell Way, Round Rock, TX 78682',
        type: 'vendor',
        businessId: demoUser._id
      }
    ];

    const createdContacts = await Contact.insertMany(contacts);
    console.log('✅ Demo contacts created');

    // Create demo transactions
    const customers = createdContacts.filter(c => c.type === 'customer');
    const vendors = createdContacts.filter(c => c.type === 'vendor');

    const transactions = [
      // Sales transactions
      {
        type: 'sale',
        customerId: customers[0]._id,
        products: [
          {
            productId: createdProducts[0]._id, // iPhone 15 Pro
            quantity: 2,
            price: 999.99
          },
          {
            productId: createdProducts[5]._id, // AirPods Pro
            quantity: 2,
            price: 249.99
          }
        ],
        totalAmount: 2499.96,
        date: new Date('2024-01-15'),
        businessId: demoUser._id
      },
      {
        type: 'sale',
        customerId: customers[1]._id,
        products: [
          {
            productId: createdProducts[2]._id, // MacBook Pro
            quantity: 1,
            price: 2499.99
          }
        ],
        totalAmount: 2499.99,
        date: new Date('2024-01-20'),
        businessId: demoUser._id
      },
      {
        type: 'sale',
        customerId: customers[2]._id,
        products: [
          {
            productId: createdProducts[1]._id, // Samsung Galaxy S24
            quantity: 1,
            price: 899.99
          },
          {
            productId: createdProducts[7]._id, // Apple Watch
            quantity: 1,
            price: 399.99
          }
        ],
        totalAmount: 1299.98,
        date: new Date('2024-01-25'),
        businessId: demoUser._id
      },
      // Purchase transactions
      {
        type: 'purchase',
        vendorId: vendors[0]._id, // Apple
        products: [
          {
            productId: createdProducts[0]._id, // iPhone 15 Pro
            quantity: 50,
            price: 750.00
          },
          {
            productId: createdProducts[5]._id, // AirPods Pro
            quantity: 100,
            price: 180.00
          }
        ],
        totalAmount: 55500.00,
        date: new Date('2024-01-10'),
        businessId: demoUser._id
      },
      {
        type: 'purchase',
        vendorId: vendors[1]._id, // Samsung
        products: [
          {
            productId: createdProducts[1]._id, // Samsung Galaxy S24
            quantity: 40,
            price: 650.00
          }
        ],
        totalAmount: 26000.00,
        date: new Date('2024-01-12'),
        businessId: demoUser._id
      }
    ];

    await Transaction.insertMany(transactions);
    console.log('✅ Demo transactions created');

    // Update product stock based on transactions
    // Note: In real app, this would be handled by transaction creation logic
    await Product.findByIdAndUpdate(createdProducts[0]._id, { $inc: { stock: 48 } }); // iPhone: +50 -2 = 48
    await Product.findByIdAndUpdate(createdProducts[1]._id, { $inc: { stock: 39 } }); // Samsung: +40 -1 = 39
    await Product.findByIdAndUpdate(createdProducts[2]._id, { $inc: { stock: -1 } }); // MacBook: -1
    await Product.findByIdAndUpdate(createdProducts[5]._id, { $inc: { stock: 98 } }); // AirPods: +100 -2 = 98
    await Product.findByIdAndUpdate(createdProducts[7]._id, { $inc: { stock: -1 } }); // Apple Watch: -1

    console.log('✅ Product stock updated');
    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Demo Data Summary:');
    console.log('- 1 Demo User (demo@example.com / demo123)');
    console.log('- 10 Products across multiple categories');
    console.log('- 7 Contacts (4 customers, 3 vendors)');
    console.log('- 5 Transactions (3 sales, 2 purchases)');
    console.log('\n🔑 Login Credentials:');
    console.log('Email: demo@example.com');
    console.log('Password: demo123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

module.exports = seedData;
