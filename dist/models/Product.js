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
const productSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
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
        enum: ['burgers', 'sides', 'beverages', 'desserts', 'breakfast', 'lunch', 'dinner', 'snacks', 'other'],
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
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    costPrice: {
        type: Number,
        required: [true, 'Cost price is required'],
        min: [0, 'Cost price cannot be negative']
    },
    image: {
        type: String,
        trim: true
    },
    ingredients: [{
            type: String,
            trim: true
        }],
    allergens: [{
            type: String,
            enum: ['dairy', 'eggs', 'fish', 'shellfish', 'tree nuts', 'peanuts', 'wheat', 'soy', 'gluten'],
            trim: true
        }],
    nutritionalInfo: {
        calories: {
            type: Number,
            min: [0, 'Calories cannot be negative']
        },
        protein: {
            type: Number,
            min: [0, 'Protein cannot be negative']
        },
        carbs: {
            type: Number,
            min: [0, 'Carbs cannot be negative']
        },
        fat: {
            type: Number,
            min: [0, 'Fat cannot be negative']
        },
        fiber: {
            type: Number,
            min: [0, 'Fiber cannot be negative']
        }
    },
    preparationTime: {
        type: Number,
        min: [0, 'Preparation time cannot be negative']
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    sortOrder: {
        type: Number,
        default: 0
    },
    tags: [{
            type: String,
            trim: true
        }],
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});
productSchema.index({ category: 1, isAvailable: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ sortOrder: 1 });
productSchema.virtual('profitMargin').get(function () {
    if (this.costPrice === 0)
        return 0;
    return Math.round(((this.price - this.costPrice) / this.price) * 100);
});
productSchema.virtual('profitAmount').get(function () {
    return this.price - this.costPrice;
});
productSchema.pre('save', function (next) {
    if (this.price < this.costPrice) {
        next(new Error('Price cannot be less than cost price'));
    }
    next();
});
exports.default = mongoose_1.default.model('Product', productSchema);
//# sourceMappingURL=Product.js.map