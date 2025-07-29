import mongoose, { Document } from 'mongoose';
export interface ISettings extends Document {
    businessName: string;
    businessAddress: string;
    businessPhone: string;
    businessEmail: string;
    businessWebsite?: string;
    currency: string;
    timezone: string;
    language: string;
    taxRate: number;
    taxInclusive: boolean;
    lowStockThreshold: number;
    autoReorderEnabled: boolean;
    emailNotifications: {
        lowStock: boolean;
        newOrders: boolean;
        dailyReports: boolean;
        weeklyReports: boolean;
    };
    smsNotifications: {
        lowStock: boolean;
        newOrders: boolean;
    };
    receiptSettings: {
        headerText: string;
        footerText: string;
        showTax: boolean;
        showLogo: boolean;
        logoUrl?: string;
    };
    orderSettings: {
        autoAcceptOrders: boolean;
        requireCustomerInfo: boolean;
        allowCustomOrders: boolean;
        maxOrderValue: number;
        minOrderValue: number;
    };
    inventorySettings: {
        trackExpiryDates: boolean;
        expiryWarningDays: number;
        allowNegativeStock: boolean;
        autoAdjustPricing: boolean;
    };
    systemSettings: {
        maintenanceMode: boolean;
        backupFrequency: string;
        dataRetentionDays: number;
        maxFileSize: number;
    };
    createdBy: mongoose.Types.ObjectId;
    updatedBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<ISettings, {}, {}, {}, mongoose.Document<unknown, {}, ISettings, {}> & ISettings & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Settings.d.ts.map