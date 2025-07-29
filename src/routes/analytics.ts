import express from 'express';
import {
  getDashboardAnalytics,
  getSalesAnalytics,
  getInventoryAnalytics,
  getProductAnalytics,
  getRevenueAnalytics
} from '../controllers/analyticsController';
import { protect } from '../middleware/auth';

const router = express.Router();

// All routes are protected
router.use(protect);

// Dashboard analytics
router.get('/dashboard', getDashboardAnalytics);

// Sales analytics
router.get('/sales', getSalesAnalytics);

// Inventory analytics
router.get('/inventory', getInventoryAnalytics);

// Product analytics
router.get('/products', getProductAnalytics);

// Revenue analytics
router.get('/revenue', getRevenueAnalytics);

export default router; 