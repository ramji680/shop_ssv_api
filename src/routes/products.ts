import express from 'express';
import {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getProductsByCategory,
  getProductAnalytics,
  toggleProductAvailability,
  toggleProductFeatured,
  updateProductSortOrder
} from '../controllers/productController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// All routes are protected
router.use(protect);

// Get all products
router.get('/', getAllProducts);

// Get product analytics
router.get('/analytics', getProductAnalytics);

// Get featured products
router.get('/featured', getFeaturedProducts);

// Get products by category
router.get('/category/:category', getProductsByCategory);

// Get single product
router.get('/:id', getProduct);

// Create new product (Admin/Manager only)
router.post('/', authorize('admin', 'manager'), createProduct);

// Update product (Admin/Manager only)
router.put('/:id', authorize('admin', 'manager'), updateProduct);

// Delete product (Admin only)
router.delete('/:id', authorize('admin'), deleteProduct);

// Toggle product availability (Admin/Manager only)
router.patch('/:id/toggle-availability', authorize('admin', 'manager'), toggleProductAvailability);

// Toggle product featured status (Admin/Manager only)
router.patch('/:id/toggle-featured', authorize('admin', 'manager'), toggleProductFeatured);

// Update product sort order (Admin/Manager only)
router.patch('/:id/sort-order', authorize('admin', 'manager'), updateProductSortOrder);

export default router; 