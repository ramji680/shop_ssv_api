"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSampleUsers = exports.logout = exports.validateSession = exports.getMe = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const generateToken = (userId) => {
    return jsonwebtoken_1.default.sign({ userId }, process.env.JWT_SECRET || 'fallback-secret', {
        expiresIn: process.env.JWT_EXPIRE || '30d'
    });
};
const register = async (req, res) => {
    try {
        const { name, username, email, password, userType } = req.body;
        const userExists = await User_1.default.findOne({
            $or: [{ email }, { username }]
        });
        if (userExists) {
            res.status(400).json({
                success: false,
                message: 'User with this email or username already exists'
            });
            return;
        }
        const user = await User_1.default.create({
            name,
            username,
            email,
            password,
            userType: userType || 'staff'
        });
        if (user) {
            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                user: {
                    id: user._id,
                    name: user.name,
                    username: user.username,
                    email: user.email,
                    userType: user.userType
                },
                token: generateToken(user._id.toString())
            });
        }
    }
    catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password, username, userType } = req.body;
        if (username && userType) {
            const user = await User_1.default.findOne({
                username: username.toLowerCase(),
                userType,
                isActive: true
            }).select('+password');
            if (!user) {
                res.status(401).json({
                    success: false,
                    userType,
                    message: 'Invalid credentials'
                });
                return;
            }
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                res.status(401).json({
                    success: false,
                    userType,
                    message: 'Invalid credentials'
                });
                return;
            }
            user.lastLogin = new Date();
            await user.save();
            res.json({
                success: true,
                userType: user.userType,
                message: 'Login successful',
                token: generateToken(user._id.toString()),
                user: {
                    id: user._id,
                    username: user.username,
                    userType: user.userType,
                    name: user.name
                }
            });
            return;
        }
        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
            return;
        }
        const user = await User_1.default.findOne({ email }).select('+password');
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
            return;
        }
        if (!user.isActive) {
            res.status(401).json({
                success: false,
                message: 'Account is deactivated'
            });
            return;
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
            return;
        }
        user.lastLogin = new Date();
        await user.save();
        res.json({
            success: true,
            message: 'Login successful',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                userType: user.userType
            },
            token: generateToken(user._id.toString())
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
exports.login = login;
const getMe = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user?.id);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }
        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                userType: user.userType,
                lastLogin: user.lastLogin
            }
        });
    }
    catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
exports.getMe = getMe;
const validateSession = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user?.id);
        if (!user) {
            res.status(401).json({
                valid: false,
                message: 'User not found'
            });
            return;
        }
        res.json({
            valid: true,
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                userType: user.userType
            }
        });
    }
    catch (error) {
        console.error('Session validation error:', error);
        res.status(401).json({
            valid: false,
            message: 'Invalid token'
        });
    }
};
exports.validateSession = validateSession;
const logout = async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    }
    catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
exports.logout = logout;
const setupSampleUsers = async (req, res) => {
    try {
        const existingUsers = await User_1.default.find({
            $or: [
                { username: 'admin' },
                { username: 'chef' }
            ]
        });
        if (existingUsers.length > 0) {
            res.json({
                success: true,
                message: 'Sample users already exist'
            });
            return;
        }
        const sampleUsers = [
            {
                name: 'Administrator',
                username: 'admin',
                email: 'admin@shop.com',
                password: 'admin123',
                userType: 'admin'
            },
            {
                name: 'Kitchen Chef',
                username: 'chef',
                email: 'chef@shop.com',
                password: 'chef123',
                userType: 'chef'
            }
        ];
        const createdUsers = await User_1.default.create(sampleUsers);
        res.status(201).json({
            success: true,
            message: 'Sample users created successfully',
            users: createdUsers.map(user => ({
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                userType: user.userType
            }))
        });
    }
    catch (error) {
        console.error('Setup sample users error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
exports.setupSampleUsers = setupSampleUsers;
//# sourceMappingURL=authController.js.map