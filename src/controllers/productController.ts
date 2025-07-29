import { Request, Response } from 'express';
import Product from '../models/Product';

// @desc    Get all products
// @route   GET /api/products
// @access  Private
export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      search, 
      availability,
      featured,
      sortBy = 'sortOrder',
      sortOrder = 'asc'
    } = req.query;

    const query: any = {};

    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }

    // Filter by availability
    if (availability && availability !== 'all') {
      query.isAvailable = availability === 'available';
    }

    // Filter by featured
    if (featured && featured !== 'all') {
      query.isFeatured = featured === 'featured';
    }

    // Search functionality
    if (search) {
      const searchString = search as string;
      query.$or = [
        { name: { $regex: searchString, $options: 'i' } },
        { sku: { $regex: searchString, $options: 'i' } },
        { barcode: { $regex: searchString, $options: 'i' } },
        { description: { $regex: searchString, $options: 'i' } },
        { tags: { $in: [new RegExp(searchString, 'i')] } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('createdBy', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Product.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / Number(limit));

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private
export const getProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('createdBy', 'name email')
      .lean();

    if (!product) {
      res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const productData = {
      ...req.body,
      createdBy: req.user._id
    };

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error: any) {
    console.error('Create product error:', error);
    
    if (error.code === 11000) {
      res.status(400).json({ 
        success: false, 
        message: 'SKU already exists' 
      });
      return;
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      res.status(400).json({ 
        success: false, 
        message: messages.join(', ') 
      });
      return;
    }

    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    if (!product) {
      res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error: any) {
    console.error('Update product error:', error);
    
    if (error.code === 11000) {
      res.status(400).json({ 
        success: false, 
        message: 'SKU already exists' 
      });
      return;
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      res.status(400).json({ 
        success: false, 
        message: messages.join(', ') 
      });
      return;
    }

    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Private
export const getFeaturedProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await Product.find({ 
      isFeatured: true, 
      isAvailable: true 
    })
    .populate('createdBy', 'name email')
    .sort({ sortOrder: 1, name: 1 })
    .lean();

    res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get products by category
// @route   GET /api/products/category/:category
// @access  Private
export const getProductsByCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find({ 
        category, 
        isAvailable: true 
      })
      .populate('createdBy', 'name email')
      .sort({ sortOrder: 1, name: 1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
      Product.countDocuments({ category, isAvailable: true })
    ]);

    const totalPages = Math.ceil(total / Number(limit));

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error('Get products by category error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get product analytics
// @route   GET /api/products/analytics
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
      avgCost
    ] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ isAvailable: true }),
      Product.countDocuments({ isFeatured: true }),
      Product.aggregate([
        { $group: { 
          _id: null, 
          totalValue: { $sum: '$price' } 
        }}
      ]),
      Product.aggregate([
        { $group: { 
          _id: '$category', 
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          totalValue: { $sum: '$price' }
        }},
        { $sort: { count: -1 } }
      ]),
      Product.aggregate([
        { $group: { 
          _id: null, 
          avgPrice: { $avg: '$price' } 
        }}
      ]),
      Product.aggregate([
        { $group: { 
          _id: null, 
          avgCost: { $avg: '$costPrice' } 
        }}
      ])
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
        avgCost: avgCost[0]?.avgCost || 0
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

// @desc    Toggle product availability
// @route   PATCH /api/products/:id/toggle-availability
// @access  Private
export const toggleProductAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
      return;
    }

    product.isAvailable = !product.isAvailable;
    await product.save();

    res.status(200).json({
      success: true,
      data: product,
      message: `Product ${product.isAvailable ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Toggle product availability error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Toggle product featured status
// @route   PATCH /api/products/:id/toggle-featured
// @access  Private
export const toggleProductFeatured = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
      return;
    }

    product.isFeatured = !product.isFeatured;
    await product.save();

    res.status(200).json({
      success: true,
      data: product,
      message: `Product ${product.isFeatured ? 'featured' : 'unfeatured'} successfully`
    });
  } catch (error) {
    console.error('Toggle product featured error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Update product sort order
// @route   PATCH /api/products/:id/sort-order
// @access  Private
export const updateProductSortOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sortOrder } = req.body;
    
    if (typeof sortOrder !== 'number') {
      res.status(400).json({ 
        success: false, 
        message: 'Sort order must be a number' 
      });
      return;
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { sortOrder },
      { new: true }
    ).populate('createdBy', 'name email');

    if (!product) {
      res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: product,
      message: 'Sort order updated successfully'
    });
  } catch (error) {
    console.error('Update product sort order error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
}; 