import express from 'express';
import { IProduct } from '../models/Product';
import Product from '../models/Product';

const router = express.Router();

// Mock data for chef production (in real app, this would be in database)
const mockProductionData = new Map<string, { dailyCount: number; totalToday: number }>();

// Get all products with daily production data
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find();
    const today = new Date().toLocaleDateString();

    const productsWithProduction = products.map((product: IProduct) => {
      const key = `${product._id}-${today}`;
      const production = mockProductionData.get(key) || { dailyCount: 0, totalToday: 0 };

      return {
        id: product._id,
        name: product.name,
        emoji: '🍽️', // Default emoji since it's not in the model
        category: product.category,
        price: product.price,
        dailyCount: production.dailyCount,
        totalToday: production.totalToday,
      };
    });

    res.json(productsWithProduction);
  } catch (error) {
    console.error('Error fetching chef products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Add product to daily production
router.post('/products/:productId/add', async (req, res) => {
  try {
    const { productId } = req.params;
    const today = new Date().toLocaleDateString();
    const key = `${productId}-${today}`;

    const currentProduction = mockProductionData.get(key) || { dailyCount: 0, totalToday: 0 };
    currentProduction.dailyCount += 1;
    currentProduction.totalToday += 1;
    mockProductionData.set(key, currentProduction);

    const product = await Product.findById(productId);
    return res.json({
      id: product?._id,
      name: product?.name,
      emoji: '🍽️', // Default emoji
      category: product?.category,
      price: product?.price,
      dailyCount: currentProduction.dailyCount,
      totalToday: currentProduction.totalToday,
    });
  } catch (error) {
    console.error('Error adding product to production:', error);
    return res.status(500).json({ error: 'Failed to add product to production' });
  }
});

// Remove product from daily production
router.post('/products/:productId/remove', async (req, res) => {
  try {
    const { productId } = req.params;
    const today = new Date().toLocaleDateString();
    const key = `${productId}-${today}`;

    const currentProduction = mockProductionData.get(key) || { dailyCount: 0, totalToday: 0 };

    if (currentProduction.dailyCount === 0) {
      return res.status(400).json({ error: 'No production to remove' });
    }

    currentProduction.dailyCount = Math.max(0, currentProduction.dailyCount - 1);
    currentProduction.totalToday = Math.max(0, currentProduction.totalToday - 1);
    mockProductionData.set(key, currentProduction);

    const product = await Product.findById(productId);
    return res.json({
      id: product?._id,
      name: product?.name,
      emoji: '🍽️', // Default emoji
      category: product?.category,
      price: product?.price,
      dailyCount: currentProduction.dailyCount,
      totalToday: currentProduction.totalToday,
    });
  } catch (error) {
    console.error('Error removing product from production:', error);
    return res.status(500).json({ error: 'Failed to remove product from production' });
  }
});

// Get chef statistics
router.get('/stats', async (req, res) => {
  try {
    const today = new Date().toLocaleDateString();
    
    let totalDailyProduction = 0;
    let totalTodayProduction = 0;
    let topProduct = 'No products yet';

    // Calculate totals from mock data
    for (const [key, production] of mockProductionData.entries()) {
      if (key.includes(today)) {
        totalDailyProduction += production.dailyCount;
        totalTodayProduction += production.totalToday;
      }
    }

    // Find top product (simplified)
    if (totalTodayProduction > 0) {
      topProduct = 'Most Popular Item';
    }

    return res.json({
      totalDailyProduction,
      totalTodayProduction,
      topProduct,
      date: today,
    });
  } catch (error) {
    console.error('Error fetching chef stats:', error);
    return res.status(500).json({ error: 'Failed to fetch chef stats' });
  }
});

// Get kitchen status
router.get('/kitchen-status', async (req, res) => {
  try {
    // You can add more complex logic here to determine kitchen status
    // For now, we'll return a simple status
    return res.json({
      status: 'operational',
      message: 'Kitchen is running smoothly!',
    });
  } catch (error) {
    console.error('Error fetching kitchen status:', error);
    return res.status(500).json({ error: 'Failed to fetch kitchen status' });
  }
});

// Get pending orders
router.get('/pending-orders', async (req, res) => {
  try {
    // This would typically fetch from an orders collection
    // For now, we'll return an empty array
    return res.json([]);
  } catch (error) {
    console.error('Error fetching pending orders:', error);
    return res.status(500).json({ error: 'Failed to fetch pending orders' });
  }
});

export default router; 