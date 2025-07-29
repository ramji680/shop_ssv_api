"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const analyticsController_1 = require("../controllers/analyticsController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.use(auth_1.protect);
router.get('/dashboard', analyticsController_1.getDashboardAnalytics);
router.get('/sales', analyticsController_1.getSalesAnalytics);
router.get('/inventory', analyticsController_1.getInventoryAnalytics);
router.get('/products', analyticsController_1.getProductAnalytics);
router.get('/revenue', analyticsController_1.getRevenueAnalytics);
exports.default = router;
//# sourceMappingURL=analytics.js.map