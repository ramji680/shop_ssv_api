"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportSettings = exports.updateSystemSettings = exports.getSystemSettings = exports.updateNotificationSettings = exports.getNotificationSettings = exports.updateBusinessInfo = exports.getBusinessInfo = exports.resetSettings = exports.updateSettings = exports.getSettings = void 0;
const Settings_1 = __importDefault(require("../models/Settings"));
const getSettings = async (req, res) => {
    try {
        let settings = await Settings_1.default.findOne().populate('createdBy updatedBy', 'name email');
        if (!settings) {
            settings = await Settings_1.default.create({
                businessName: 'My Fast Food Shop',
                businessAddress: '123 Main Street, City, State 12345',
                businessPhone: '+1 (555) 123-4567',
                businessEmail: 'admin@shop.com',
                createdBy: req.user._id,
                updatedBy: req.user._id
            });
        }
        res.status(200).json({
            success: true,
            data: settings
        });
    }
    catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
exports.getSettings = getSettings;
const updateSettings = async (req, res) => {
    try {
        let settings = await Settings_1.default.findOne();
        if (!settings) {
            settings = await Settings_1.default.create({
                ...req.body,
                createdBy: req.user._id,
                updatedBy: req.user._id
            });
        }
        else {
            settings = await Settings_1.default.findOneAndUpdate({}, { ...req.body, updatedBy: req.user._id }, { new: true, runValidators: true }).populate('createdBy updatedBy', 'name email');
        }
        res.status(200).json({
            success: true,
            data: settings,
            message: 'Settings updated successfully'
        });
    }
    catch (error) {
        console.error('Update settings error:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((err) => err.message);
            res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
exports.updateSettings = updateSettings;
const resetSettings = async (req, res) => {
    try {
        const defaultSettings = {
            businessName: 'My Fast Food Shop',
            businessAddress: '123 Main Street, City, State 12345',
            businessPhone: '+1 (555) 123-4567',
            businessEmail: 'admin@shop.com',
            currency: 'USD',
            timezone: 'UTC',
            language: 'en',
            taxRate: 0,
            taxInclusive: false,
            lowStockThreshold: 10,
            autoReorderEnabled: false,
            emailNotifications: {
                lowStock: true,
                newOrders: true,
                dailyReports: false,
                weeklyReports: false
            },
            smsNotifications: {
                lowStock: false,
                newOrders: false
            },
            receiptSettings: {
                headerText: 'Thank you for your order!',
                footerText: 'Please visit again!',
                showTax: true,
                showLogo: false
            },
            orderSettings: {
                autoAcceptOrders: false,
                requireCustomerInfo: true,
                allowCustomOrders: false,
                maxOrderValue: 1000,
                minOrderValue: 0
            },
            inventorySettings: {
                trackExpiryDates: true,
                expiryWarningDays: 30,
                allowNegativeStock: false,
                autoAdjustPricing: false
            },
            systemSettings: {
                maintenanceMode: false,
                backupFrequency: 'daily',
                dataRetentionDays: 365,
                maxFileSize: 5
            }
        };
        const settings = await Settings_1.default.findOneAndUpdate({}, { ...defaultSettings, updatedBy: req.user._id }, { new: true, upsert: true, runValidators: true }).populate('createdBy updatedBy', 'name email');
        res.status(200).json({
            success: true,
            data: settings,
            message: 'Settings reset to defaults successfully'
        });
    }
    catch (error) {
        console.error('Reset settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
exports.resetSettings = resetSettings;
const getBusinessInfo = async (req, res) => {
    try {
        const settings = await Settings_1.default.findOne().select('businessName businessAddress businessPhone businessEmail businessWebsite currency timezone');
        if (!settings) {
            res.status(404).json({
                success: false,
                message: 'Business information not found'
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: settings
        });
    }
    catch (error) {
        console.error('Get business info error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
exports.getBusinessInfo = getBusinessInfo;
const updateBusinessInfo = async (req, res) => {
    try {
        const { businessName, businessAddress, businessPhone, businessEmail, businessWebsite } = req.body;
        const settings = await Settings_1.default.findOneAndUpdate({}, {
            businessName,
            businessAddress,
            businessPhone,
            businessEmail,
            businessWebsite,
            updatedBy: req.user._id
        }, { new: true, runValidators: true }).populate('createdBy updatedBy', 'name email');
        if (!settings) {
            res.status(404).json({
                success: false,
                message: 'Settings not found'
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: settings,
            message: 'Business information updated successfully'
        });
    }
    catch (error) {
        console.error('Update business info error:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((err) => err.message);
            res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
exports.updateBusinessInfo = updateBusinessInfo;
const getNotificationSettings = async (req, res) => {
    try {
        const settings = await Settings_1.default.findOne().select('emailNotifications smsNotifications');
        if (!settings) {
            res.status(404).json({
                success: false,
                message: 'Notification settings not found'
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: {
                emailNotifications: settings.emailNotifications,
                smsNotifications: settings.smsNotifications
            }
        });
    }
    catch (error) {
        console.error('Get notification settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
exports.getNotificationSettings = getNotificationSettings;
const updateNotificationSettings = async (req, res) => {
    try {
        const { emailNotifications, smsNotifications } = req.body;
        const settings = await Settings_1.default.findOneAndUpdate({}, {
            emailNotifications,
            smsNotifications,
            updatedBy: req.user._id
        }, { new: true, runValidators: true }).populate('createdBy updatedBy', 'name email');
        if (!settings) {
            res.status(404).json({
                success: false,
                message: 'Settings not found'
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: settings,
            message: 'Notification settings updated successfully'
        });
    }
    catch (error) {
        console.error('Update notification settings error:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((err) => err.message);
            res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
exports.updateNotificationSettings = updateNotificationSettings;
const getSystemSettings = async (req, res) => {
    try {
        const settings = await Settings_1.default.findOne().select('systemSettings');
        if (!settings) {
            res.status(404).json({
                success: false,
                message: 'System settings not found'
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: settings.systemSettings
        });
    }
    catch (error) {
        console.error('Get system settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
exports.getSystemSettings = getSystemSettings;
const updateSystemSettings = async (req, res) => {
    try {
        const { systemSettings } = req.body;
        const settings = await Settings_1.default.findOneAndUpdate({}, {
            systemSettings,
            updatedBy: req.user._id
        }, { new: true, runValidators: true }).populate('createdBy updatedBy', 'name email');
        if (!settings) {
            res.status(404).json({
                success: false,
                message: 'Settings not found'
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: settings,
            message: 'System settings updated successfully'
        });
    }
    catch (error) {
        console.error('Update system settings error:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((err) => err.message);
            res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
exports.updateSystemSettings = updateSystemSettings;
const exportSettings = async (req, res) => {
    try {
        const settings = await Settings_1.default.findOne().populate('createdBy updatedBy', 'name email');
        if (!settings) {
            res.status(404).json({
                success: false,
                message: 'Settings not found'
            });
            return;
        }
        const exportData = {
            exportDate: new Date().toISOString(),
            settings: settings.toObject()
        };
        res.status(200).json({
            success: true,
            data: exportData
        });
    }
    catch (error) {
        console.error('Export settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
exports.exportSettings = exportSettings;
//# sourceMappingURL=settingsController.js.map