"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const orderItemSchema = new mongoose_1.Schema({
    product: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1']
    },
    price: {
        type: Number,
        required: true,
        min: [0, 'Price cannot be negative']
    },
    total: {
        type: Number,
        required: true,
        min: [0, 'Total cannot be negative']
    }
});
const orderSchema = new mongoose_1.Schema({
    orderNumber: {
        type: String,
        required: true,
        unique: true
    },
    items: [orderItemSchema],
    subtotal: {
        type: Number,
        required: true,
        min: [0, 'Subtotal cannot be negative']
    },
    tax: {
        type: Number,
        required: true,
        min: [0, 'Tax cannot be negative'],
        default: 0
    },
    total: {
        type: Number,
        required: true,
        min: [0, 'Total cannot be negative']
    },
    status: {
        type: String,
        enum: ['pending', 'preparing', 'ready', 'completed', 'cancelled'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'mobile'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },
    customerName: {
        type: String,
        trim: true
    },
    customerPhone: {
        type: String,
        trim: true
    },
    notes: {
        type: String,
        maxlength: [500, 'Notes cannot be more than 500 characters']
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    completedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    completedAt: {
        type: Date
    }
}, {
    timestamps: true
});
orderSchema.pre('save', async function (next) {
    if (this.isNew) {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const todayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const todayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        const orderCount = await mongoose_1.default.model('Order').countDocuments({
            createdAt: { $gte: todayStart, $lt: todayEnd }
        });
        this.orderNumber = `ORD-${year}${month}${day}-${String(orderCount + 1).padStart(3, '0')}`;
    }
    next();
});
exports.default = mongoose_1.default.model('Order', orderSchema);
//# sourceMappingURL=Order.js.map