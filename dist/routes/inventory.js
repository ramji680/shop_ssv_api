"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const inventoryController_1 = require("../controllers/inventoryController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.use(auth_1.protect);
router.get('/', inventoryController_1.getAllInventory);
router.get('/analytics', inventoryController_1.getInventoryAnalytics);
router.get('/alerts/low-stock', inventoryController_1.getLowStockAlerts);
router.get('/:id', inventoryController_1.getInventoryItem);
router.post('/', (0, auth_1.authorize)('admin', 'manager'), inventoryController_1.createInventoryItem);
router.put('/:id', (0, auth_1.authorize)('admin', 'manager'), inventoryController_1.updateInventoryItem);
router.delete('/:id', (0, auth_1.authorize)('admin'), inventoryController_1.deleteInventoryItem);
router.patch('/:id/stock', (0, auth_1.authorize)('admin', 'manager', 'staff'), inventoryController_1.adjustStock);
router.post('/bulk-stock-adjustment', (0, auth_1.authorize)('admin', 'manager'), inventoryController_1.bulkStockAdjustment);
exports.default = router;
//# sourceMappingURL=inventory.js.map