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

const port = process.env.PORT || 5000;

connectDB();

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

app.listen(port, () => console.log(`Server started on port ${port}`));
