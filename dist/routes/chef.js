"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Product_1 = __importDefault(require("../models/Product"));
const router = express_1.default.Router();
const mockProductionData = new Map();
router.get('/products', async (req, res) => {
    try {
        const products = await Product_1.default.find();
        const today = new Date().toLocaleDateString();
        const productsWithProduction = products.map((product) => {
            const key = `${product._id}-${today}`;
            const production = mockProductionData.get(key) || { dailyCount: 0, totalToday: 0 };
            return {
                id: product._id,
                name: product.name,
                emoji: '🍽️',
                category: product.category,
                price: product.price,
                dailyCount: production.dailyCount,
                totalToday: production.totalToday,
            };
        });
        res.json(productsWithProduction);
    }
    catch (error) {
        console.error('Error fetching chef products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});
router.post('/products/:productId/add', async (req, res) => {
    try {
        const { productId } = req.params;
        const today = new Date().toLocaleDateString();
        const key = `${productId}-${today}`;
        const currentProduction = mockProductionData.get(key) || { dailyCount: 0, totalToday: 0 };
        currentProduction.dailyCount += 1;
        currentProduction.totalToday += 1;
        mockProductionData.set(key, currentProduction);
        const product = await Product_1.default.findById(productId);
        return res.json({
            id: product?._id,
            name: product?.name,
            emoji: '🍽️',
            category: product?.category,
            price: product?.price,
            dailyCount: currentProduction.dailyCount,
            totalToday: currentProduction.totalToday,
        });
    }
    catch (error) {
        console.error('Error adding product to production:', error);
        return res.status(500).json({ error: 'Failed to add product to production' });
    }
});
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
        const product = await Product_1.default.findById(productId);
        return res.json({
            id: product?._id,
            name: product?.name,
            emoji: '🍽️',
            category: product?.category,
            price: product?.price,
            dailyCount: currentProduction.dailyCount,
            totalToday: currentProduction.totalToday,
        });
    }
    catch (error) {
        console.error('Error removing product from production:', error);
        return res.status(500).json({ error: 'Failed to remove product from production' });
    }
});
router.get('/stats', async (req, res) => {
    try {
        const today = new Date().toLocaleDateString();
        let totalDailyProduction = 0;
        let totalTodayProduction = 0;
        let topProduct = 'No products yet';
        for (const [key, production] of mockProductionData.entries()) {
            if (key.includes(today)) {
                totalDailyProduction += production.dailyCount;
                totalTodayProduction += production.totalToday;
            }
        }
        if (totalTodayProduction > 0) {
            topProduct = 'Most Popular Item';
        }
        return res.json({
            totalDailyProduction,
            totalTodayProduction,
            topProduct,
            date: today,
        });
    }
    catch (error) {
        console.error('Error fetching chef stats:', error);
        return res.status(500).json({ error: 'Failed to fetch chef stats' });
    }
});
router.get('/kitchen-status', async (req, res) => {
    try {
        return res.json({
            status: 'operational',
            message: 'Kitchen is running smoothly!',
        });
    }
    catch (error) {
        console.error('Error fetching kitchen status:', error);
        return res.status(500).json({ error: 'Failed to fetch kitchen status' });
    }
});
router.get('/pending-orders', async (req, res) => {
    try {
        return res.json([]);
    }
    catch (error) {
        console.error('Error fetching pending orders:', error);
        return res.status(500).json({ error: 'Failed to fetch pending orders' });
    }
});
exports.default = router;
//# sourceMappingURL=chef.js.map