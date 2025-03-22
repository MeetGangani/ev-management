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

// Middleware to handle double /api prefix
app.use((req, res, next) => {
  if (req.url.startsWith('/api/api/')) {
    // Remove one /api/ prefix
    req.url = req.url.replace('/api/api/', '/api/');
    console.log(`Fixed double API prefix. New URL: ${req.url}`);
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
