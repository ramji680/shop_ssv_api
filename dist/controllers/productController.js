"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProductSortOrder = exports.toggleProductFeatured = exports.toggleProductAvailability = exports.getProductAnalytics = exports.getProductsByCategory = exports.getFeaturedProducts = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProduct = exports.getAllProducts = void 0;
const Product_1 = __importDefault(require("../models/Product"));
const getAllProducts = async (req, res) => {
    try {
        const { page = 1, limit = 10, category, search, availability, featured, sortBy = 'sortOrder', sortOrder = 'asc' } = req.query;
        const query = {};
        if (category && category !== 'all') {
            query.category = category;
        }
        if (availability && availability !== 'all') {
            query.isAvailable = availability === 'available';
        }
        if (featured && featured !== 'all') {
            query.isFeatured = featured === 'featured';
        }
        if (search) {
            const searchString = search;
            query.$or = [
                { name: { $regex: searchString, $options: 'i' } },
                { sku: { $regex: searchString, $options: 'i' } },
                { barcode: { $regex: searchString, $options: 'i' } },
                { description: { $regex: searchString, $options: 'i' } },
                { tags: { $in: [new RegExp(searchString, 'i')] } }
            ];
        }
        const skip = (Number(page) - 1) * Number(limit);
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
        const [products, total] = await Promise.all([
            Product_1.default.find(query)
                .populate('createdBy', 'name email')
                .sort(sort)
                .skip(skip)
                .limit(Number(limit))
                .lean(),
            Product_1.default.countDocuments(query)
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
    }
    catch (error) {
        console.error('Get all products error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
exports.getAllProducts = getAllProducts;
const getProduct = async (req, res) => {
    try {
        const product = await Product_1.default.findById(req.params.id)
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
    }
    catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
exports.getProduct = getProduct;
const createProduct = async (req, res) => {
    try {
        const productData = {
            ...req.body,
            createdBy: req.user._id
        };
        const product = await Product_1.default.create(productData);
        res.status(201).json({
            success: true,
            data: product
        });
    }
    catch (error) {
        console.error('Create product error:', error);
        if (error.code === 11000) {
            res.status(400).json({
                success: false,
                message: 'SKU already exists'
            });
            return;
        }
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((err) => err.message);
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
exports.createProduct = createProduct;
const updateProduct = async (req, res) => {
    try {
        const product = await Product_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('createdBy', 'name email');
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
    }
    catch (error) {
        console.error('Update product error:', error);
        if (error.code === 11000) {
            res.status(400).json({
                success: false,
                message: 'SKU already exists'
            });
            return;
        }
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((err) => err.message);
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
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res) => {
    try {
        const product = await Product_1.default.findByIdAndDelete(req.params.id);
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
    }
    catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
exports.deleteProduct = deleteProduct;
const getFeaturedProducts = async (req, res) => {
    try {
        const products = await Product_1.default.find({
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
    }
    catch (error) {
        console.error('Get featured products error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
exports.getFeaturedProducts = getFeaturedProducts;
const getProductsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const [products, total] = await Promise.all([
            Product_1.default.find({
                category,
                isAvailable: true
            })
                .populate('createdBy', 'name email')
                .sort({ sortOrder: 1, name: 1 })
                .skip(skip)
                .limit(Number(limit))
                .lean(),
            Product_1.default.countDocuments({ category, isAvailable: true })
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
    }
    catch (error) {
        console.error('Get products by category error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
exports.getProductsByCategory = getProductsByCategory;
const getProductAnalytics = async (req, res) => {
    try {
        const [totalProducts, availableProducts, featuredProducts, totalValue, categoryStats, avgPrice, avgCost] = await Promise.all([
            Product_1.default.countDocuments(),
            Product_1.default.countDocuments({ isAvailable: true }),
            Product_1.default.countDocuments({ isFeatured: true }),
            Product_1.default.aggregate([
                { $group: {
                        _id: null,
                        totalValue: { $sum: '$price' }
                    } }
            ]),
            Product_1.default.aggregate([
                { $group: {
                        _id: '$category',
                        count: { $sum: 1 },
                        avgPrice: { $avg: '$price' },
                        totalValue: { $sum: '$price' }
                    } },
                { $sort: { count: -1 } }
            ]),
            Product_1.default.aggregate([
                { $group: {
                        _id: null,
                        avgPrice: { $avg: '$price' }
                    } }
            ]),
            Product_1.default.aggregate([
                { $group: {
                        _id: null,
                        avgCost: { $avg: '$costPrice' }
                    } }
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
    }
    catch (error) {
        console.error('Get product analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
exports.getProductAnalytics = getProductAnalytics;
const toggleProductAvailability = async (req, res) => {
    try {
        const product = await Product_1.default.findById(req.params.id);
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
    }
    catch (error) {
        console.error('Toggle product availability error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
exports.toggleProductAvailability = toggleProductAvailability;
const toggleProductFeatured = async (req, res) => {
    try {
        const product = await Product_1.default.findById(req.params.id);
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
    }
    catch (error) {
        console.error('Toggle product featured error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
exports.toggleProductFeatured = toggleProductFeatured;
const updateProductSortOrder = async (req, res) => {
    try {
        const { sortOrder } = req.body;
        if (typeof sortOrder !== 'number') {
            res.status(400).json({
                success: false,
                message: 'Sort order must be a number'
            });
            return;
        }
        const product = await Product_1.default.findByIdAndUpdate(req.params.id, { sortOrder }, { new: true }).populate('createdBy', 'name email');
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
    }
    catch (error) {
        console.error('Update product sort order error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
exports.updateProductSortOrder = updateProductSortOrder;
//# sourceMappingURL=productController.js.map