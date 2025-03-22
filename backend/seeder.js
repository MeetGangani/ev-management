import mongoose from 'mongoose';
import dotenv from 'dotenv';
import colors from 'colors';
import User from './models/userModel.js';
import connectDB from './config/db.js';

dotenv.config();

connectDB();

const importData = async () => {
  try {
    // Clear all existing users
    // Uncomment if you want to clear all users first
    // await User.deleteMany();

    // Check if admin already exists to avoid duplicate
    const adminExists = await User.findOne({ email: 'admin@example.com' });
    
    if (!adminExists) {
      // Create admin user
      const admin = await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123', // Change this to a secure password
        role: 'admin',
        aadharVerified: true
        // Note: We're intentionally not setting aadhaar for admin
      });
      
      console.log(`Admin user created: ${admin.name}`.green.inverse);
    } else {
      console.log('Admin user already exists'.yellow);
    }

    console.log('Data Import Complete'.green.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await User.deleteMany();

    console.log('Data Destroyed'.red.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

// If -d flag is passed, destroy data, else import
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
} 