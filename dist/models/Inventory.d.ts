import mongoose, { Document } from 'mongoose';
export interface IInventory extends Document {
    name: string;
    description?: string;
    category: string;
    sku: string;
    barcode?: string;
    unit: string;
    currentStock: number;
    minStock: number;
    maxStock: number;
    costPrice: number;
    sellingPrice: number;
    supplier?: {
        name: string;
        contact: string;
        email?: string;
    };
    location?: string;
    expiryDate?: Date;
    isActive: boolean;
    lastUpdated: Date;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IInventory, {}, {}, {}, mongoose.Document<unknown, {}, IInventory, {}> & IInventory & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Inventory.d.ts.map