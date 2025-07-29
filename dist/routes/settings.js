"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const settingsController_1 = require("../controllers/settingsController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.use(auth_1.protect);
router.get('/', settingsController_1.getSettings);
router.put('/', (0, auth_1.authorize)('admin'), settingsController_1.updateSettings);
router.post('/reset', (0, auth_1.authorize)('admin'), settingsController_1.resetSettings);
router.get('/export', (0, auth_1.authorize)('admin'), settingsController_1.exportSettings);
router.get('/business', settingsController_1.getBusinessInfo);
router.put('/business', (0, auth_1.authorize)('admin'), settingsController_1.updateBusinessInfo);
router.get('/notifications', settingsController_1.getNotificationSettings);
router.put('/notifications', (0, auth_1.authorize)('admin'), settingsController_1.updateNotificationSettings);
router.get('/system', (0, auth_1.authorize)('admin'), settingsController_1.getSystemSettings);
router.put('/system', (0, auth_1.authorize)('admin'), settingsController_1.updateSystemSettings);
exports.default = router;
//# sourceMappingURL=settings.js.map