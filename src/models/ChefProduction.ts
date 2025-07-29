import mongoose, { Schema, Document } from 'mongoose';

export interface IChefProduction extends Document {
  productId: mongoose.Types.ObjectId;
  date: Date;
  dailyCount: number;
  totalToday: number;
  createdAt: Date;
  updatedAt: Date;
}

const ChefProductionSchema = new Schema<IChefProduction>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    dailyCount: {
      type: Number,
      default: 0,
    },
    totalToday: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure unique product-date combinations
ChefProductionSchema.index({ productId: 1, date: 1 }, { unique: true });

export const ChefProduction = mongoose.model<IChefProduction>('ChefProduction', ChefProductionSchema); 