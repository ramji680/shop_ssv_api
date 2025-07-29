"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/register', authController_1.register);
router.post('/login', authController_1.login);
router.post('/setup-sample-users', authController_1.setupSampleUsers);
router.use(auth_1.protect);
router.get('/me', authController_1.getMe);
router.get('/validate', authController_1.validateSession);
router.post('/logout', authController_1.logout);
exports.default = router;
//# sourceMappingURL=auth.js.map