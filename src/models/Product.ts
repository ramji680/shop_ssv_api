import mongoose, { Document, Schema } from 'mongoose';

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
  preparationTime?: number; // in minutes
  isAvailable: boolean;
  isFeatured: boolean;
  sortOrder: number;
  tags?: string[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>({
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
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for better query performance
productSchema.index({ category: 1, isAvailable: 1 });
productSchema.index({ sku: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ sortOrder: 1 });

// Virtual for profit margin
productSchema.virtual('profitMargin').get(function() {
  if (this.costPrice === 0) return 0;
  return Math.round(((this.price - this.costPrice) / this.price) * 100);
});

// Virtual for profit amount
productSchema.virtual('profitAmount').get(function() {
  return this.price - this.costPrice;
});

// Pre-save middleware to ensure price is not less than cost
productSchema.pre('save', function(next) {
  if (this.price < this.costPrice) {
    next(new Error('Price cannot be less than cost price'));
  }
  next();
});

export default mongoose.model<IProduct>('Product', productSchema); 