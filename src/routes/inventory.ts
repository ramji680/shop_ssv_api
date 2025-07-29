import express from 'express';
import {
  getAllInventory,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  adjustStock,
  getLowStockAlerts,
  getInventoryAnalytics,
  bulkStockAdjustment
} from '../controllers/inventoryController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// All routes are protected
router.use(protect);

// Get all inventory items
router.get('/', getAllInventory);

// Get inventory analytics
router.get('/analytics', getInventoryAnalytics);

// Get low stock alerts
router.get('/alerts/low-stock', getLowStockAlerts);

// Get single inventory item
router.get('/:id', getInventoryItem);

// Create new inventory item (Admin/Manager only)
router.post('/', authorize('admin', 'manager'), createInventoryItem);

// Update inventory item (Admin/Manager only)
router.put('/:id', authorize('admin', 'manager'), updateInventoryItem);

// Delete inventory item (Admin only)
router.delete('/:id', authorize('admin'), deleteInventoryItem);

// Adjust stock level (Admin/Manager/Staff)
router.patch('/:id/stock', authorize('admin', 'manager', 'staff'), adjustStock);

// Bulk stock adjustment (Admin/Manager only)
router.post('/bulk-stock-adjustment', authorize('admin', 'manager'), bulkStockAdjustment);

export default router; 