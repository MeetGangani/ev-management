import express from 'express';
import {
  getEVs,
  getEVsByStation,
  getEVById,
  createEV,
  updateEV,
  deleteEV,
  updateBatteryLevel,
  addMaintenanceRecord,
} from '../controllers/evController.js';
import { protect, admin, stationMaster, verifiedCustomer } from '../middleware/authMiddleware.js';

const router = express.Router();

// Admin-only routes
router.route('/')
  .get(protect, admin, getEVs)
  .post(protect, admin, createEV);

// Routes accessible to verified customers, station masters, and admins
router.get('/station/:stationId', protect, verifiedCustomer, getEVsByStation);
router.get('/:id', protect, verifiedCustomer, getEVById);

// Admin and station master routes
router.put('/:id', protect, stationMaster, updateEV);
router.delete('/:id', protect, admin, deleteEV);

// Station master specific routes
router.patch('/:id/battery', protect, stationMaster, updateBatteryLevel);
router.post('/:id/maintenance', protect, stationMaster, addMaintenanceRecord);

export default router; 