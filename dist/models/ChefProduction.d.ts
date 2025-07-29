import mongoose, { Document } from 'mongoose';
export interface IChefProduction extends Document {
    productId: mongoose.Types.ObjectId;
    date: Date;
    dailyCount: number;
    totalToday: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare const ChefProduction: mongoose.Model<IChefProduction, {}, {}, {}, mongoose.Document<unknown, {}, IChefProduction, {}> & IChefProduction & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=ChefProduction.d.ts.map