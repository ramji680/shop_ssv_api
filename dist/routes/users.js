"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.use(auth_1.protect);
router.get('/', auth_1.admin, userController_1.getUsers);
router.get('/:id', auth_1.admin, userController_1.getUserById);
router.put('/:id', auth_1.admin, userController_1.updateUser);
router.delete('/:id', auth_1.admin, userController_1.deleteUser);
router.put('/profile', userController_1.updateProfile);
router.put('/change-password', userController_1.changePassword);
exports.default = router;
//# sourceMappingURL=users.js.map