"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.admin = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'fallback-secret');
            req.user = await User_1.default.findById(decoded.userId).select('-password');
            if (!req.user) {
                res.status(401).json({ message: 'Not authorized' });
                return;
            }
            next();
        }
        catch (error) {
            console.error('Auth middleware error:', error);
            res.status(401).json({ message: 'Not authorized' });
            return;
        }
    }
    else {
        res.status(401).json({ message: 'Not authorized, no token' });
        return;
    }
};
exports.protect = protect;
const admin = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({ message: 'Not authorized' });
        return;
    }
    if (req.user.userType !== 'admin') {
        res.status(403).json({
            message: 'Admin access required'
        });
        return;
    }
    next();
};
exports.admin = admin;
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }
        if (!roles.includes(req.user.userType)) {
            res.status(403).json({
                message: `User type ${req.user.userType} is not authorized to access this route`
            });
            return;
        }
        next();
    };
};
exports.authorize = authorize;
//# sourceMappingURL=auth.js.map