import { Request, Response } from 'express';
import Settings from '../models/Settings';

// @desc    Get current settings
// @route   GET /api/settings
// @access  Private
export const getSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    let settings = await Settings.findOne().populate('createdBy updatedBy', 'name email');

    if (!settings) {
      // Create default settings if none exist
      settings = await Settings.create({
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
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Update settings
// @route   PUT /api/settings
// @access  Private (Admin only)
export const updateSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      // Create new settings if none exist
      settings = await Settings.create({
        ...req.body,
        createdBy: req.user._id,
        updatedBy: req.user._id
      });
    } else {
      // Update existing settings
      settings = await Settings.findOneAndUpdate(
        {},
        { ...req.body, updatedBy: req.user._id },
        { new: true, runValidators: true }
      ).populate('createdBy updatedBy', 'name email');
    }

    res.status(200).json({
      success: true,
      data: settings,
      message: 'Settings updated successfully'
    });
  } catch (error: any) {
    console.error('Update settings error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
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

// @desc    Reset settings to defaults
// @route   POST /api/settings/reset
// @access  Private (Admin only)
export const resetSettings = async (req: Request, res: Response): Promise<void> => {
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

    const settings = await Settings.findOneAndUpdate(
      {},
      { ...defaultSettings, updatedBy: req.user._id },
      { new: true, upsert: true, runValidators: true }
    ).populate('createdBy updatedBy', 'name email');

    res.status(200).json({
      success: true,
      data: settings,
      message: 'Settings reset to defaults successfully'
    });
  } catch (error) {
    console.error('Reset settings error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get business information
// @route   GET /api/settings/business
// @access  Public
export const getBusinessInfo = async (req: Request, res: Response): Promise<void> => {
  try {
    const settings = await Settings.findOne().select('businessName businessAddress businessPhone businessEmail businessWebsite currency timezone');

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
  } catch (error) {
    console.error('Get business info error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Update business information
// @route   PUT /api/settings/business
// @access  Private (Admin only)
export const updateBusinessInfo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { businessName, businessAddress, businessPhone, businessEmail, businessWebsite } = req.body;

    const settings = await Settings.findOneAndUpdate(
      {},
      { 
        businessName, 
        businessAddress, 
        businessPhone, 
        businessEmail, 
        businessWebsite,
        updatedBy: req.user._id 
      },
      { new: true, runValidators: true }
    ).populate('createdBy updatedBy', 'name email');

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
  } catch (error: any) {
    console.error('Update business info error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
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

// @desc    Get notification settings
// @route   GET /api/settings/notifications
// @access  Private
export const getNotificationSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const settings = await Settings.findOne().select('emailNotifications smsNotifications');

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
  } catch (error) {
    console.error('Get notification settings error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Update notification settings
// @route   PUT /api/settings/notifications
// @access  Private (Admin only)
export const updateNotificationSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { emailNotifications, smsNotifications } = req.body;

    const settings = await Settings.findOneAndUpdate(
      {},
      { 
        emailNotifications, 
        smsNotifications,
        updatedBy: req.user._id 
      },
      { new: true, runValidators: true }
    ).populate('createdBy updatedBy', 'name email');

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
  } catch (error: any) {
    console.error('Update notification settings error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
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

// @desc    Get system settings
// @route   GET /api/settings/system
// @access  Private (Admin only)
export const getSystemSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const settings = await Settings.findOne().select('systemSettings');

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
  } catch (error) {
    console.error('Get system settings error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Update system settings
// @route   PUT /api/settings/system
// @access  Private (Admin only)
export const updateSystemSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { systemSettings } = req.body;

    const settings = await Settings.findOneAndUpdate(
      {},
      { 
        systemSettings,
        updatedBy: req.user._id 
      },
      { new: true, runValidators: true }
    ).populate('createdBy updatedBy', 'name email');

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
  } catch (error: any) {
    console.error('Update system settings error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
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

// @desc    Export settings
// @route   GET /api/settings/export
// @access  Private (Admin only)
export const exportSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const settings = await Settings.findOne().populate('createdBy updatedBy', 'name email');

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
  } catch (error) {
    console.error('Export settings error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
}; 