import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';
import bcryptjs from 'bcryptjs';
import mongoose from 'mongoose';

// @desc    Auth user & get token
// @route   POST /api/users/auth
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    generateToken(res, user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      aadhaar: user.aadhaar,
      aadharVerified: user.aadharVerified,
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, aadhaar } = req.body;

  // Validate required fields
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please add all required fields');
  }

  // Check if user exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Check if aadhar is required (for customers)
  if (role === 'customer' && !aadhaar) {
    res.status(400);
    throw new Error('Aadhar number is required for customers');
  }

  // Check if aadhar already exists (if provided)
  if (aadhaar) {
    const aadharExists = await User.findOne({ aadhaar });
    if (aadharExists) {
      res.status(400);
      throw new Error('A user with this Aadhar number already exists');
    }
  }

  // Create user data object
  const userData = {
    name,
    email,
    password,
    role: role || 'customer',
    phone: phone || '',
  };

  // Only add aadhaar if it's provided
  if (aadhaar) {
    userData.aadhaar = aadhaar;
  }

  // Create user
  const user = await User.create(userData);

  if (user) {
    generateToken(res, user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      aadhaar: user.aadhaar || null,
      aadharVerified: user.aadharVerified,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Logout user / clear cookie
// @route   POST /api/users/logout
// @access  Public
const logoutUser = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      aadhaar: user.aadhaar,
      aadharVerified: user.aadharVerified,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;

    // Only admin can change roles
    if (req.body.role && req.user.role === 'admin') {
      user.role = req.body.role;
    }

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone,
      aadhaar: updatedUser.aadhaar,
      aadharVerified: updatedUser.aadharVerified,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Verify user's aadhar number
// @route   POST /api/users/verify-aadhar
// @access  Private
const verifyAadhar = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { aadhaar } = req.body;

  if (!aadhaar) {
    res.status(400);
    throw new Error('Please provide your Aadhar number');
  }

  if (user) {
    // In a real app, here you would call an external API to verify the Aadhar
    // For this demo, we'll just assume the verification is successful
    user.aadhaar = aadhaar;
    user.aadharVerified = true;
    await user.save();

    res.json({
      _id: user._id,
      aadharVerified: true,
      message: 'Aadhar verified successfully',
      aadhaar: user.aadhaar,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Create a station master
// @route   POST /api/users/admin/create-station-master
// @access  Private/Admin
const createStationMaster = asyncHandler(async (req, res) => {
  console.log('Create Station Master request:', req.body);
  
  const { name, email, password, phone, aadhaar } = req.body;

  // Check if all required fields are provided
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please provide name, email, and password');
  }

  // Check if email already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists with this email');
  }

  try {
    // Manual document creation to bypass potential Mongoose index issues
    const userDoc = {
      name,
      email,
      role: 'stationMaster',
      phone: phone || '',
      aadharVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Only add aadhaar if it's provided and not empty
    if (aadhaar && aadhaar.trim() !== '') {
      console.log('Checking if aadhaar exists:', aadhaar);
      const aadharExists = await User.findOne({ aadhaar });
      
      if (aadharExists) {
        res.status(400);
        throw new Error('A user with this Aadhar number already exists');
      }
      
      userDoc.aadhaar = aadhaar;
    }
    
    // Hash password
    const salt = await bcryptjs.genSalt(10);
    userDoc.password = await bcryptjs.hash(password, salt);
    
    console.log('Creating station master with data:', userDoc);
    
    // Insert directly to avoid Mongoose validation
    const result = await mongoose.connection.db.collection('users').insertOne(userDoc);
    
    if (result.acknowledged) {
      const user = await User.findById(result.insertedId);
      
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        aadhaar: user.aadhaar,
        aadharVerified: user.aadharVerified,
      });
    } else {
      res.status(400);
      throw new Error('Failed to create station master');
    }
  } catch (error) {
    console.error('Error creating station master:', error);
    res.status(500).json({
      message: error.message,
      stack: error.stack
    });
  }
});

// @desc    Get all station masters
// @route   GET /api/users/admin/station-masters
// @access  Private/Admin
const getStationMasters = asyncHandler(async (req, res) => {
  try {
    const stationMasters = await User.find({ role: 'stationMaster' }).select('-password');
    res.json(stationMasters);
  } catch (error) {
    console.error('Error fetching station masters:', error);
    res.status(500).json({
      message: error.message,
      stack: error.stack
    });
  }
});

// @desc    Get all users
// @route   GET /api/users/admin/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      message: error.message,
      stack: error.stack
    });
  }
});

export {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  verifyAadhar,
  createStationMaster,
  getStationMasters,
  getAllUsers,
};
