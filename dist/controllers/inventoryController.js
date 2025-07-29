"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkStockAdjustment = exports.getInventoryAnalytics = exports.getLowStockAlerts = exports.adjustStock = exports.deleteInventoryItem = exports.updateInventoryItem = exports.createInventoryItem = exports.getInventoryItem = exports.getAllInventory = void 0;
const Inventory_1 = __importDefault(require("../models/Inventory"));
const getAllInventory = async (req, res) => {
    try {
        const { page = 1, limit = 10, category, search, stockStatus, sortBy = 'lastUpdated', sortOrder = 'desc' } = req.query;
        const query = { isActive: true };
        if (category && category !== 'all') {
            query.category = category;
        }
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { sku: { $regex: search, $options: 'i' } },
                { barcode: { $regex: search, $options: 'i' } }
            ];
        }
        if (stockStatus && stockStatus !== 'all') {
            switch (stockStatus) {
                case 'out_of_stock':
                    query.currentStock = 0;
                    break;
                case 'low_stock':
                    query.$expr = { $lte: ['$currentStock', '$minStock'] };
                    break;
                case 'in_stock':
                    query.$expr = { $gt: ['$currentStock', '$minStock'] };
                    break;
            }
        }
        const skip = (Number(page) - 1) * Number(limit);
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
        const [inventory, total] = await Promise.all([
            Inventory_1.default.find(query)
                .populate('createdBy', 'name email')
                .sort(sort)
                .skip(skip)
                .limit(Number(limit))
                .lean(),
            Inventory_1.default.countDocuments(query)
        ]);
        const totalPages = Math.ceil(total / Number(limit));
        res.status(200).json({
            success: true,
            data: inventory,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages
            }
        });
    }
    catch (error) {
        console.error('Get all inventory error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
exports.getAllInventory = getAllInventory;
const getInventoryItem = async (req, res) => {
    try {
        const inventory = await Inventory_1.default.findById(req.params.id)
            .populate('createdBy', 'name email')
            .lean();
        if (!inventory) {
            res.status(404).json({
                success: false,
                message: 'Inventory item not found'
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: inventory
        });
    }
    catch (error) {
        console.error('Get inventory item error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
exports.getInventoryItem = getInventoryItem;
const createInventoryItem = async (req, res) => {
    try {
        const inventoryData = {
            ...req.body,
            createdBy: req.user._id
        };
        const inventory = await Inventory_1.default.create(inventoryData);
        res.status(201).json({
            success: true,
            data: inventory
        });
    }
    catch (error) {
        console.error('Create inventory error:', error);
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
exports.createInventoryItem = createInventoryItem;
const updateInventoryItem = async (req, res) => {
    try {
        const inventory = await Inventory_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('createdBy', 'name email');
        if (!inventory) {
            res.status(404).json({
                success: false,
                message: 'Inventory item not found'
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: inventory
        });
    }
    catch (error) {
        console.error('Update inventory error:', error);
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
exports.updateInventoryItem = updateInventoryItem;
const deleteInventoryItem = async (req, res) => {
    try {
        const inventory = await Inventory_1.default.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
        if (!inventory) {
            res.status(404).json({
                success: false,
                message: 'Inventory item not found'
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'Inventory item deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete inventory error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
exports.deleteInventoryItem = deleteInventoryItem;
const adjustStock = async (req, res) => {
    try {
        const { quantity, type, reason } = req.body;
        if (!quantity || !type || !reason) {
            res.status(400).json({
                success: false,
                message: 'Quantity, type, and reason are required'
            });
            return;
        }
        const inventory = await Inventory_1.default.findById(req.params.id);
        if (!inventory) {
            res.status(404).json({
                success: false,
                message: 'Inventory item not found'
            });
            return;
        }
        const newStock = type === 'add'
            ? inventory.currentStock + quantity
            : inventory.currentStock - quantity;
        if (newStock < 0) {
            res.status(400).json({
                success: false,
                message: 'Stock cannot be negative'
            });
            return;
        }
        inventory.currentStock = newStock;
        inventory.lastUpdated = new Date();
        await inventory.save();
        res.status(200).json({
            success: true,
            data: inventory,
            message: `Stock ${type === 'add' ? 'added' : 'subtracted'} successfully`
        });
    }
    catch (error) {
        console.error('Adjust stock error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
exports.adjustStock = adjustStock;
const getLowStockAlerts = async (req, res) => {
    try {
        const lowStockItems = await Inventory_1.default.find({
            isActive: true,
            $expr: { $lte: ['$currentStock', '$minStock'] }
        })
            .populate('createdBy', 'name email')
            .sort({ currentStock: 1 })
            .lean();
        res.status(200).json({
            success: true,
            data: lowStockItems,
            count: lowStockItems.length
        });
    }
    catch (error) {
        console.error('Get low stock alerts error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
exports.getLowStockAlerts = getLowStockAlerts;
const getInventoryAnalytics = async (req, res) => {
    try {
        const [totalItems, outOfStock, lowStock, totalValue, categoryStats] = await Promise.all([
            Inventory_1.default.countDocuments({ isActive: true }),
            Inventory_1.default.countDocuments({
                isActive: true,
                currentStock: 0
            }),
            Inventory_1.default.countDocuments({
                isActive: true,
                $expr: { $lte: ['$currentStock', '$minStock'] }
            }),
            Inventory_1.default.aggregate([
                { $match: { isActive: true } },
                { $group: {
                        _id: null,
                        totalValue: { $sum: { $multiply: ['$currentStock', '$costPrice'] } }
                    } }
            ]),
            Inventory_1.default.aggregate([
                { $match: { isActive: true } },
                { $group: {
                        _id: '$category',
                        count: { $sum: 1 },
                        totalStock: { $sum: '$currentStock' },
                        totalValue: { $sum: { $multiply: ['$currentStock', '$costPrice'] } }
                    } },
                { $sort: { count: -1 } }
            ])
        ]);
        res.status(200).json({
            success: true,
            data: {
                totalItems,
                outOfStock,
                lowStock,
                totalValue: totalValue[0]?.totalValue || 0,
                categoryStats
            }
        });
    }
    catch (error) {
        console.error('Get inventory analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
exports.getInventoryAnalytics = getInventoryAnalytics;
const bulkStockAdjustment = async (req, res) => {
    try {
        const { adjustments } = req.body;
        if (!Array.isArray(adjustments) || adjustments.length === 0) {
            res.status(400).json({
                success: false,
                message: 'Adjustments array is required'
            });
            return;
        }
        const results = [];
        const errors = [];
        for (const adjustment of adjustments) {
            try {
                const { itemId, quantity, type, reason } = adjustment;
                const inventory = await Inventory_1.default.findById(itemId);
                if (!inventory) {
                    errors.push({ itemId, error: 'Item not found' });
                    continue;
                }
                const newStock = type === 'add'
                    ? inventory.currentStock + quantity
                    : inventory.currentStock - quantity;
                if (newStock < 0) {
                    errors.push({ itemId, error: 'Stock cannot be negative' });
                    continue;
                }
                inventory.currentStock = newStock;
                inventory.lastUpdated = new Date();
                await inventory.save();
                results.push({ itemId, newStock, success: true });
            }
            catch (error) {
                errors.push({ itemId: adjustment.itemId, error: 'Update failed' });
            }
        }
        res.status(200).json({
            success: true,
            data: {
                successful: results,
                errors
            },
            message: `Updated ${results.length} items, ${errors.length} errors`
        });
    }
    catch (error) {
        console.error('Bulk stock adjustment error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
exports.bulkStockAdjustment = bulkStockAdjustment;
//# sourceMappingURL=inventoryController.js.map