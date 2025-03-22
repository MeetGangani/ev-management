import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';

const protect = asyncHandler(async (req, res, next) => {
  let token;

  token = req.cookies.jwt;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.userId).select('-password');

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  } else {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

// Middleware for admin-only routes
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as an admin');
  }
};

// Middleware for station master routes
const stationMaster = (req, res, next) => {
  if (req.user && (req.user.role === 'stationMaster' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as a station master');
  }
};

// Middleware for verified customer routes
const verifiedCustomer = (req, res, next) => {
  if (
    req.user && 
    (
      (req.user.role === 'customer' && req.user.aadharVerified) || 
      req.user.role === 'stationMaster' || 
      req.user.role === 'admin'
    )
  ) {
    next();
  } else if (req.user && req.user.role === 'customer' && !req.user.aadharVerified) {
    res.status(403);
    throw new Error('Please verify your Aadhaar to access this resource');
  } else {
    res.status(401);
    throw new Error('Not authorized');
  }
};

// Middleware for routes accessible to both admin and station master
const adminOrStationMaster = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'stationMaster')) {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized. This resource requires admin or station master privileges.');
  }
};

export { protect, admin, stationMaster, verifiedCustomer, adminOrStationMaster };
