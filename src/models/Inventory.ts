import mongoose, { Document, Schema } from 'mongoose';

export interface IInventory extends Document {
  name: string;
  description?: string;
  category: string;
  sku: string;
  barcode?: string;
  unit: string; // pieces, kg, liters, etc.
  currentStock: number;
  minStock: number; // reorder point
  maxStock: number;
  costPrice: number;
  sellingPrice: number;
  supplier?: {
    name: string;
    contact: string;
    email?: string;
  };
  location?: string; // storage location
  expiryDate?: Date;
  isActive: boolean;
  lastUpdated: Date;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const inventorySchema = new Schema<IInventory>({
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
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for better query performance (sku is already indexed by unique: true)
inventorySchema.index({ category: 1, isActive: 1 });
inventorySchema.index({ currentStock: 1 });

// Virtual for stock status
inventorySchema.virtual('stockStatus').get(function() {
  if (this.currentStock <= 0) return 'out_of_stock';
  if (this.currentStock <= this.minStock) return 'low_stock';
  return 'in_stock';
});

// Virtual for stock percentage
inventorySchema.virtual('stockPercentage').get(function() {
  if (this.maxStock === 0) return 0;
  return Math.round((this.currentStock / this.maxStock) * 100);
});

// Pre-save middleware to update lastUpdated
inventorySchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

export default mongoose.model<IInventory>('Inventory', inventorySchema); 