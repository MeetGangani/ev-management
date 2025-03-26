import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import connectDB from './config/db.js';
import cookieParser from 'cookie-parser';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import userRoutes from './routes/userRoutes.js';
import stationRoutes from './routes/stationRoutes.js';
import evRoutes from './routes/evRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import mongoose from 'mongoose';

const port = process.env.PORT || 5000;

// Connect to MongoDB
const startServer = async () => {
  try {
    await connectDB();
    
    const app = express();
    
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    
    app.use(cookieParser());
    
    // Middleware to handle API prefix issues
    app.use((req, res, next) => {
      // Log all API requests
      if (req.url.includes('/api') || req.url.includes('lapi')) {
        console.log(`Original request URL: ${req.url}`);
      }
      
      // Fix double /api prefix
      if (req.url.startsWith('/api/api/')) {
        req.url = req.url.replace('/api/api/', '/api/');
        console.log(`Fixed double API prefix. New URL: ${req.url}`);
      }
      
      // Fix missing leading slash
      if (req.url.startsWith('api/')) {
        req.url = `/${req.url}`;
        console.log(`Added leading slash. New URL: ${req.url}`);
      }
      
      // Fix 'lapi' typo
      if (req.url.includes('lapi/')) {
        req.url = req.url.replace('lapi/', '/api/');
        console.log(`Fixed 'lapi' typo. New URL: ${req.url}`);
      }
      
      next();
    });
    
    // Health check route
    app.get('/health', (req, res) => {
      res.status(200).json({ 
        status: 'ok',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' 
      });
    });
    
    // Routes
    app.use('/api/users', userRoutes);
    app.use('/api/stations', stationRoutes);
    app.use('/api/evs', evRoutes);
    app.use('/api/bookings', bookingRoutes);
    
    if (process.env.NODE_ENV === 'production') {
      const __dirname = path.resolve();
      app.use(express.static(path.join(__dirname, '/frontend/dist')));
    
      app.get('*', (req, res) =>
        res.sendFile(path.resolve(__dirname, 'frontend', 'dist', 'index.html'))
      );
    } else {
      app.get('/', (req, res) => {
        res.send('API is running....');
      });
    }
    
    app.use(notFound);
    app.use(errorHandler);
    
    const server = app.listen(port, () => {
      console.log(`Server started on port ${port}`);
    });
    
    // Handle server errors
    server.on('error', (error) => {
      console.error(`Server error: ${error.message}`);
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use. Try a different port.`);
        process.exit(1);
      }
    });
    
    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down gracefully');
      server.close(() => {
        console.log('Process terminated');
      });
    });
    
    process.on('SIGINT', () => {
      console.log('SIGINT received. Shutting down gracefully');
      server.close(() => {
        console.log('Process terminated');
      });
    });
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      console.error('UNCAUGHT EXCEPTION! Shutting down...');
      console.error(err.name, err.message);
      process.exit(1);
    });
    
    // Handle unhandled rejections
    process.on('unhandledRejection', (err) => {
      console.error('UNHANDLED REJECTION! Shutting down...');
      console.error(err);
      server.close(() => {
        process.exit(1);
      });
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

startServer();
