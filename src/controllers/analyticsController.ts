import { Request, Response } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import Inventory from '../models/Inventory';

// @desc    Get dashboard analytics
// @route   GET /api/analytics/dashboard
// @access  Private
export const getDashboardAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Sales analytics
    const [
      totalSales,
      todaySales,
      weekSales,
      monthSales,
      totalOrders,
      todayOrders,
      weekOrders,
      monthOrders,
      avgOrderValue,
      topProducts,
      salesByCategory,
      salesTrend
    ] = await Promise.all([
      // Total sales
      Order.aggregate([
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]).catch(() => [{ total: 0 }]),
      // Today's sales
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfToday } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]).catch(() => [{ total: 0 }]),
      // This week's sales
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfWeek } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]).catch(() => [{ total: 0 }]),
      // This month's sales
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]).catch(() => [{ total: 0 }]),
      // Total orders
      Order.countDocuments(),
      // Today's orders
      Order.countDocuments({ createdAt: { $gte: startOfToday } }),
      // This week's orders
      Order.countDocuments({ createdAt: { $gte: startOfWeek } }),
      // This month's orders
      Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
      // Average order value
      Order.aggregate([
        { $group: { _id: null, avg: { $avg: '$totalAmount' } } }
      ]).catch(() => [{ avg: 0 }]),
      // Top selling products
      Order.aggregate([
        { $unwind: '$items' },
        { $group: { _id: '$items.product', totalSold: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
        { $unwind: '$product' },
        { $project: { name: '$product.name', totalSold: 1, revenue: 1 } }
      ]).catch(() => []),
      // Sales by category
      Order.aggregate([
        { $unwind: '$items' },
        { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'product' } },
        { $unwind: '$product' },
        { $group: { _id: '$product.category', totalSold: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
        { $sort: { revenue: -1 } }
      ]).catch(() => []),
      // Sales trend (last 7 days)
      Order.aggregate([
        { $match: { createdAt: { $gte: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000) } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, sales: { $sum: '$totalAmount' }, orders: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]).catch(() => [])
    ]);

    // Inventory analytics
    const [
      totalInventoryItems,
      lowStockItems,
      outOfStockItems,
      totalInventoryValue,
      inventoryByCategory
    ] = await Promise.all([
      Inventory.countDocuments(),
      Inventory.countDocuments({ currentStock: { $lte: '$minStock' } }),
      Inventory.countDocuments({ currentStock: 0 }),
      Inventory.aggregate([
        { $group: { _id: null, totalValue: { $sum: { $multiply: ['$currentStock', '$costPrice'] } } } }
      ]),
      Inventory.aggregate([
        { $group: { _id: '$category', totalItems: { $sum: 1 }, totalValue: { $sum: { $multiply: ['$currentStock', '$costPrice'] } } } },
        { $sort: { totalValue: -1 } }
      ])
    ]);

    // Product analytics
    const [
      totalProducts,
      availableProducts,
      featuredProducts,
      totalProductValue
    ] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ isAvailable: true }),
      Product.countDocuments({ isFeatured: true }),
      Product.aggregate([
        { $group: { _id: null, totalValue: { $sum: '$price' } } }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        sales: {
          total: totalSales[0]?.total || 0,
          today: todaySales[0]?.total || 0,
          week: weekSales[0]?.total || 0,
          month: monthSales[0]?.total || 0,
          orders: {
            total: totalOrders,
            today: todayOrders,
            week: weekOrders,
            month: monthOrders
          },
          avgOrderValue: avgOrderValue[0]?.avg || 0,
          topProducts,
          byCategory: salesByCategory,
          trend: salesTrend
        },
        inventory: {
          totalItems: totalInventoryItems,
          lowStock: lowStockItems,
          outOfStock: outOfStockItems,
          totalValue: totalInventoryValue[0]?.totalValue || 0,
          byCategory: inventoryByCategory
        },
        products: {
          total: totalProducts,
          available: availableProducts,
          featured: featuredProducts,
          totalValue: totalProductValue[0]?.totalValue || 0
        }
      }
    });
  } catch (error) {
    console.error('Get dashboard analytics error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get sales analytics
// @route   GET /api/analytics/sales
// @access  Private
export const getSalesAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { period = '30', startDate, endDate } = req.query;
    
    let dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    } else {
      const days = parseInt(period as string);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      dateFilter.createdAt = { $gte: startDate };
    }

    const [
      totalSales,
      totalOrders,
      avgOrderValue,
      salesByDay,
      salesByCategory,
      topProducts,
      orderStatusStats
    ] = await Promise.all([
      // Total sales
      Order.aggregate([
        { $match: dateFilter },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      // Total orders
      Order.countDocuments(dateFilter),
      // Average order value
      Order.aggregate([
        { $match: dateFilter },
        { $group: { _id: null, avg: { $avg: '$totalAmount' } } }
      ]),
      // Sales by day
      Order.aggregate([
        { $match: dateFilter },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, sales: { $sum: '$totalAmount' }, orders: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      // Sales by category
      Order.aggregate([
        { $match: dateFilter },
        { $unwind: '$items' },
        { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'product' } },
        { $unwind: '$product' },
        { $group: { _id: '$product.category', totalSold: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
        { $sort: { revenue: -1 } }
      ]),
      // Top selling products
      Order.aggregate([
        { $match: dateFilter },
        { $unwind: '$items' },
        { $group: { _id: '$items.product', totalSold: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
        { $sort: { totalSold: -1 } },
        { $limit: 10 },
        { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
        { $unwind: '$product' },
        { $project: { name: '$product.name', category: '$product.category', totalSold: 1, revenue: 1 } }
      ]),
      // Order status statistics
      Order.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$status', count: { $sum: 1 }, totalAmount: { $sum: '$totalAmount' } } },
        { $sort: { count: -1 } }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalSales: totalSales[0]?.total || 0,
        totalOrders,
        avgOrderValue: avgOrderValue[0]?.avg || 0,
        salesByDay,
        salesByCategory,
        topProducts,
        orderStatusStats
      }
    });
  } catch (error) {
    console.error('Get sales analytics error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get inventory analytics
// @route   GET /api/analytics/inventory
// @access  Private
export const getInventoryAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const [
      totalItems,
      lowStockItems,
      outOfStockItems,
      totalValue,
      categoryStats,
      stockAlerts,
      valueByCategory,
      recentUpdates
    ] = await Promise.all([
      Inventory.countDocuments(),
      Inventory.countDocuments({ currentStock: { $lte: '$minStock' } }),
      Inventory.countDocuments({ currentStock: 0 }),
      Inventory.aggregate([
        { $group: { _id: null, totalValue: { $sum: { $multiply: ['$currentStock', '$costPrice'] } } } }
      ]),
      Inventory.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 }, totalValue: { $sum: { $multiply: ['$currentStock', '$costPrice'] } }, avgStock: { $avg: '$currentStock' } } },
        { $sort: { count: -1 } }
      ]),
      Inventory.find({ currentStock: { $lte: '$minStock' } })
        .sort({ currentStock: 1 })
        .limit(10)
        .lean(),
      Inventory.aggregate([
        { $group: { _id: '$category', totalValue: { $sum: { $multiply: ['$currentStock', '$costPrice'] } } } },
        { $sort: { totalValue: -1 } }
      ]),
      Inventory.find()
        .sort({ updatedAt: -1 })
        .limit(10)
        .populate('createdBy', 'name')
        .lean()
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalItems,
        lowStockItems,
        outOfStockItems,
        totalValue: totalValue[0]?.totalValue || 0,
        categoryStats,
        stockAlerts,
        valueByCategory,
        recentUpdates
      }
    });
  } catch (error) {
    console.error('Get inventory analytics error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get product analytics
// @route   GET /api/analytics/products
// @access  Private
export const getProductAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const [
      totalProducts,
      availableProducts,
      featuredProducts,
      totalValue,
      categoryStats,
      avgPrice,
      avgCost,
      priceRangeStats,
      topFeaturedProducts
    ] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ isAvailable: true }),
      Product.countDocuments({ isFeatured: true }),
      Product.aggregate([
        { $group: { _id: null, totalValue: { $sum: '$price' } } }
      ]),
      Product.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 }, avgPrice: { $avg: '$price' }, totalValue: { $sum: '$price' } } },
        { $sort: { count: -1 } }
      ]),
      Product.aggregate([
        { $group: { _id: null, avgPrice: { $avg: '$price' } } }
      ]),
      Product.aggregate([
        { $group: { _id: null, avgCost: { $avg: '$costPrice' } } }
      ]),
      Product.aggregate([
        { $group: { _id: null, minPrice: { $min: '$price' }, maxPrice: { $max: '$price' } } }
      ]),
      Product.find({ isFeatured: true })
        .sort({ sortOrder: 1, name: 1 })
        .limit(10)
        .lean()
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        availableProducts,
        featuredProducts,
        totalValue: totalValue[0]?.totalValue || 0,
        categoryStats,
        avgPrice: avgPrice[0]?.avgPrice || 0,
        avgCost: avgCost[0]?.avgCost || 0,
        priceRange: {
          min: priceRangeStats[0]?.minPrice || 0,
          max: priceRangeStats[0]?.maxPrice || 0
        },
        topFeaturedProducts
      }
    });
  } catch (error) {
    console.error('Get product analytics error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get revenue analytics
// @route   GET /api/analytics/revenue
// @access  Private
export const getRevenueAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [
      totalRevenue,
      revenueByDay,
      revenueByCategory,
      profitMargin,
      topRevenueProducts
    ] = await Promise.all([
      // Total revenue
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      // Revenue by day
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$totalAmount' }, orders: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      // Revenue by category
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $unwind: '$items' },
        { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'product' } },
        { $unwind: '$product' },
        { $group: { _id: '$product.category', revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }, orders: { $sum: 1 } } },
        { $sort: { revenue: -1 } }
      ]),
      // Profit margin calculation
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $unwind: '$items' },
        { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'product' } },
        { $unwind: '$product' },
        { $group: { 
          _id: null, 
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          totalCost: { $sum: { $multiply: ['$product.costPrice', '$items.quantity'] } }
        } }
      ]),
      // Top revenue products
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $unwind: '$items' },
        { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'product' } },
        { $unwind: '$product' },
        { $group: { 
          _id: '$items.product', 
          name: { $first: '$product.name' },
          category: { $first: '$product.category' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          quantity: { $sum: '$items.quantity' }
        } },
        { $sort: { revenue: -1 } },
        { $limit: 10 }
      ])
    ]);

    const profitMarginData = profitMargin[0];
    const profitMarginPercent = profitMarginData && profitMarginData.totalRevenue > 0 
      ? ((profitMarginData.totalRevenue - profitMarginData.totalCost) / profitMarginData.totalRevenue) * 100 
      : 0;

    res.status(200).json({
      success: true,
      data: {
        totalRevenue: totalRevenue[0]?.total || 0,
        revenueByDay,
        revenueByCategory,
        profitMargin: profitMarginPercent,
        topRevenueProducts
      }
    });
  } catch (error) {
    console.error('Get revenue analytics error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
}; 