import mongoose, { Document } from 'mongoose';
export interface IOrderItem {
    product: mongoose.Types.ObjectId;
    name: string;
    quantity: number;
    price: number;
    total: number;
}
export interface IOrder extends Document {
    orderNumber: string;
    items: IOrderItem[];
    subtotal: number;
    tax: number;
    total: number;
    status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
    paymentMethod: 'cash' | 'card' | 'mobile';
    paymentStatus: 'pending' | 'paid' | 'failed';
    customerName?: string;
    customerPhone?: string;
    notes?: string;
    createdBy: mongoose.Types.ObjectId;
    completedBy?: mongoose.Types.ObjectId;
    completedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IOrder, {}, {}, {}, mongoose.Document<unknown, {}, IOrder, {}> & IOrder & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Order.d.ts.map