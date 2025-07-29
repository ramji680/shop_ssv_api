"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.updateProfile = exports.deleteUser = exports.updateUser = exports.getUserById = exports.getUsers = void 0;
const User_1 = __importDefault(require("../models/User"));
const getUsers = async (req, res) => {
    try {
        const users = await User_1.default.find({}).select('-password');
        res.json({
            success: true,
            users: users.map(user => ({
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                userType: user.userType,
                isActive: user.isActive,
                lastLogin: user.lastLogin,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }))
        });
    }
    catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
exports.getUsers = getUsers;
const getUserById = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.params.id).select('-password');
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
                isActive: user.isActive,
                lastLogin: user.lastLogin,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });
    }
    catch (error) {
        console.error('Get user by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
exports.getUserById = getUserById;
const updateUser = async (req, res) => {
    try {
        const { name, email, userType, isActive } = req.body;
        const user = await User_1.default.findById(req.params.id);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }
        if (name)
            user.name = name;
        if (email)
            user.email = email;
        if (userType)
            user.userType = userType;
        if (typeof isActive === 'boolean')
            user.isActive = isActive;
        await user.save();
        res.json({
            success: true,
            message: 'User updated successfully',
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                userType: user.userType,
                isActive: user.isActive,
                lastLogin: user.lastLogin,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });
    }
    catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.params.id);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }
        if (user._id.toString() === req.user?.id) {
            res.status(400).json({
                success: false,
                message: 'Cannot delete your own account'
            });
            return;
        }
        await User_1.default.findByIdAndDelete(req.params.id);
        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
exports.deleteUser = deleteUser;
const updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body;
        const user = await User_1.default.findById(req.user?.id);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }
        if (name)
            user.name = name;
        if (email)
            user.email = email;
        await user.save();
        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                userType: user.userType,
                isActive: user.isActive,
                lastLogin: user.lastLogin,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });
    }
    catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
exports.updateProfile = updateProfile;
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User_1.default.findById(req.user?.id).select('+password');
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
            return;
        }
        user.password = newPassword;
        await user.save();
        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    }
    catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
exports.changePassword = changePassword;
//# sourceMappingURL=userController.js.map