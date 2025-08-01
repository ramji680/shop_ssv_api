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
const inventorySchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Item name is required'],
        trim: true,
        maxlength: [100, 'Name cannot be more than 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['ingredients', 'packaging', 'equipment', 'beverages', 'condiments', 'other'],
        default: 'other'
    },
    sku: {
        type: String,
        required: [true, 'SKU is required'],
        unique: true,
        trim: true
    },
    barcode: {
        type: String,
        trim: true
    },
    unit: {
        type: String,
        required: [true, 'Unit is required'],
        enum: ['pieces', 'kg', 'grams', 'liters', 'ml', 'boxes', 'packs', 'bottles'],
        default: 'pieces'
    },
    currentStock: {
        type: Number,
        required: [true, 'Current stock is required'],
        min: [0, 'Stock cannot be negative'],
        default: 0
    },
    minStock: {
        type: Number,
        required: [true, 'Minimum stock is required'],
        min: [0, 'Minimum stock cannot be negative'],
        default: 0
    },
    maxStock: {
        type: Number,
        required: [true, 'Maximum stock is required'],
        min: [0, 'Maximum stock cannot be negative'],
        default: 0
    },
    costPrice: {
        type: Number,
        required: [true, 'Cost price is required'],
        min: [0, 'Cost price cannot be negative']
    },
    sellingPrice: {
        type: Number,
        required: [true, 'Selling price is required'],
        min: [0, 'Selling price cannot be negative']
    },
    supplier: {
        name: {
            type: String,
            trim: true
        },
        contact: {
            type: String,
            trim: true
        },
        email: {
            type: String,
            trim: true,
            lowercase: true
        }
    },
    location: {
        type: String,
        trim: true
    },
    expiryDate: {
        type: Date
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});
inventorySchema.index({ category: 1, isActive: 1 });
inventorySchema.index({ currentStock: 1 });
inventorySchema.virtual('stockStatus').get(function () {
    if (this.currentStock <= 0)
        return 'out_of_stock';
    if (this.currentStock <= this.minStock)
        return 'low_stock';
    return 'in_stock';
});
inventorySchema.virtual('stockPercentage').get(function () {
    if (this.maxStock === 0)
        return 0;
    return Math.round((this.currentStock / this.maxStock) * 100);
});
inventorySchema.pre('save', function (next) {
    this.lastUpdated = new Date();
    next();
});
exports.default = mongoose_1.default.model('Inventory', inventorySchema);
//# sourceMappingURL=Inventory.js.map