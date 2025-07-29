import express from 'express';
import {
  getSettings,
  updateSettings,
  resetSettings,
  getBusinessInfo,
  updateBusinessInfo,
  getNotificationSettings,
  updateNotificationSettings,
  getSystemSettings,
  updateSystemSettings,
  exportSettings
} from '../controllers/settingsController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// All routes are protected
router.use(protect);

// General settings routes
router.get('/', getSettings);
router.put('/', authorize('admin'), updateSettings);
router.post('/reset', authorize('admin'), resetSettings);
router.get('/export', authorize('admin'), exportSettings);

// Business information routes
router.get('/business', getBusinessInfo);
router.put('/business', authorize('admin'), updateBusinessInfo);

// Notification settings routes
router.get('/notifications', getNotificationSettings);
router.put('/notifications', authorize('admin'), updateNotificationSettings);

// System settings routes
router.get('/system', authorize('admin'), getSystemSettings);
router.put('/system', authorize('admin'), updateSystemSettings);

export default router; 