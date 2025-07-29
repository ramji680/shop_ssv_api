import mongoose, { Document } from 'mongoose';
export interface IProduct extends Document {
    name: string;
    description?: string;
    category: string;
    sku: string;
    barcode?: string;
    price: number;
    costPrice: number;
    image?: string;
    ingredients?: string[];
    allergens?: string[];
    nutritionalInfo?: {
        calories?: number;
        protein?: number;
        carbs?: number;
        fat?: number;
        fiber?: number;
    };
    preparationTime?: number;
    isAvailable: boolean;
    isFeatured: boolean;
    sortOrder: number;
    tags?: string[];
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IProduct, {}, {}, {}, mongoose.Document<unknown, {}, IProduct, {}> & IProduct & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Product.d.ts.map