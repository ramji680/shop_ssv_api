"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const productController_1 = require("../controllers/productController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.use(auth_1.protect);
router.get('/', productController_1.getAllProducts);
router.get('/analytics', productController_1.getProductAnalytics);
router.get('/featured', productController_1.getFeaturedProducts);
router.get('/category/:category', productController_1.getProductsByCategory);
router.get('/:id', productController_1.getProduct);
router.post('/', (0, auth_1.authorize)('admin', 'manager'), productController_1.createProduct);
router.put('/:id', (0, auth_1.authorize)('admin', 'manager'), productController_1.updateProduct);
router.delete('/:id', (0, auth_1.authorize)('admin'), productController_1.deleteProduct);
router.patch('/:id/toggle-availability', (0, auth_1.authorize)('admin', 'manager'), productController_1.toggleProductAvailability);
router.patch('/:id/toggle-featured', (0, auth_1.authorize)('admin', 'manager'), productController_1.toggleProductFeatured);
router.patch('/:id/sort-order', (0, auth_1.authorize)('admin', 'manager'), productController_1.updateProductSortOrder);
exports.default = router;
//# sourceMappingURL=products.js.map