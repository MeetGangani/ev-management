import express from 'express';
import {
  getStations,
  getStationById,
  getNearestStations,
  createStation,
  updateStation,
  deleteStation
} from '../controllers/stationController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getStations);
router.get('/nearest', getNearestStations);
router.get('/:id', getStationById);

// Admin-only routes
router.post('/', protect, admin, createStation);
router.put('/:id', protect, admin, updateStation);
router.delete('/:id', protect, admin, deleteStation);

export default router; 