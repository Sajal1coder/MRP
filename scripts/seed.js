#!/usr/bin/env node

require('dotenv').config();
const mongoose = require('mongoose');
const seedData = require('../utils/seedData');

const runSeed = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI environment variable is not set!');
      console.log('Please update your .env file with a valid MongoDB connection string.');
      console.log('Example: MONGODB_URI=mongodb://localhost:27017/inventory_billing');
      process.exit(1);
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    await seedData();
    
    console.log('🔌 Disconnecting from MongoDB...');
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

runSeed();
