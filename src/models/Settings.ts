import mongoose, { Document, Schema } from 'mongoose';

export interface ISettings extends Document {
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  businessEmail: string;
  businessWebsite?: string;
  currency: string;
  timezone: string;
  language: string;
  taxRate: number;
  taxInclusive: boolean;
  lowStockThreshold: number;
  autoReorderEnabled: boolean;
  emailNotifications: {
    lowStock: boolean;
    newOrders: boolean;
    dailyReports: boolean;
    weeklyReports: boolean;
  };
  smsNotifications: {
    lowStock: boolean;
    newOrders: boolean;
  };
  receiptSettings: {
    headerText: string;
    footerText: string;
    showTax: boolean;
    showLogo: boolean;
    logoUrl?: string;
  };
  orderSettings: {
    autoAcceptOrders: boolean;
    requireCustomerInfo: boolean;
    allowCustomOrders: boolean;
    maxOrderValue: number;
    minOrderValue: number;
  };
  inventorySettings: {
    trackExpiryDates: boolean;
    expiryWarningDays: number;
    allowNegativeStock: boolean;
    autoAdjustPricing: boolean;
  };
  systemSettings: {
    maintenanceMode: boolean;
    backupFrequency: string;
    dataRetentionDays: number;
    maxFileSize: number;
  };
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const settingsSchema = new Schema<ISettings>({
  businessName: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true,
    maxlength: [100, 'Business name cannot be more than 100 characters']
  },
  businessAddress: {
    type: String,
    required: [true, 'Business address is required'],
    trim: true,
    maxlength: [500, 'Business address cannot be more than 500 characters']
  },
  businessPhone: {
    type: String,
    required: [true, 'Business phone is required'],
    trim: true
  },
  businessEmail: {
    type: String,
    required: [true, 'Business email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  businessWebsite: {
    type: String,
    trim: true
  },
  currency: {
    type: String,
    required: [true, 'Currency is required'],
    enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'INR', 'CNY'],
    default: 'USD'
  },
  timezone: {
    type: String,
    required: [true, 'Timezone is required'],
    default: 'UTC'
  },
  language: {
    type: String,
    required: [true, 'Language is required'],
    enum: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko'],
    default: 'en'
  },
  taxRate: {
    type: Number,
    required: [true, 'Tax rate is required'],
    min: [0, 'Tax rate cannot be negative'],
    max: [100, 'Tax rate cannot exceed 100%'],
    default: 0
  },
  taxInclusive: {
    type: Boolean,
    default: false
  },
  lowStockThreshold: {
    type: Number,
    required: [true, 'Low stock threshold is required'],
    min: [0, 'Low stock threshold cannot be negative'],
    default: 10
  },
  autoReorderEnabled: {
    type: Boolean,
    default: false
  },
  emailNotifications: {
    lowStock: {
      type: Boolean,
      default: true
    },
    newOrders: {
      type: Boolean,
      default: true
    },
    dailyReports: {
      type: Boolean,
      default: false
    },
    weeklyReports: {
      type: Boolean,
      default: false
    }
  },
  smsNotifications: {
    lowStock: {
      type: Boolean,
      default: false
    },
    newOrders: {
      type: Boolean,
      default: false
    }
  },
  receiptSettings: {
    headerText: {
      type: String,
      trim: true,
      maxlength: [200, 'Header text cannot be more than 200 characters']
    },
    footerText: {
      type: String,
      trim: true,
      maxlength: [200, 'Footer text cannot be more than 200 characters']
    },
    showTax: {
      type: Boolean,
      default: true
    },
    showLogo: {
      type: Boolean,
      default: false
    },
    logoUrl: {
      type: String,
      trim: true
    }
  },
  orderSettings: {
    autoAcceptOrders: {
      type: Boolean,
      default: false
    },
    requireCustomerInfo: {
      type: Boolean,
      default: true
    },
    allowCustomOrders: {
      type: Boolean,
      default: false
    },
    maxOrderValue: {
      type: Number,
      min: [0, 'Max order value cannot be negative'],
      default: 1000
    },
    minOrderValue: {
      type: Number,
      min: [0, 'Min order value cannot be negative'],
      default: 0
    }
  },
  inventorySettings: {
    trackExpiryDates: {
      type: Boolean,
      default: true
    },
    expiryWarningDays: {
      type: Number,
      min: [1, 'Expiry warning days must be at least 1'],
      default: 30
    },
    allowNegativeStock: {
      type: Boolean,
      default: false
    },
    autoAdjustPricing: {
      type: Boolean,
      default: false
    }
  },
  systemSettings: {
    maintenanceMode: {
      type: Boolean,
      default: false
    },
    backupFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'daily'
    },
    dataRetentionDays: {
      type: Number,
      min: [1, 'Data retention days must be at least 1'],
      default: 365
    },
    maxFileSize: {
      type: Number,
      min: [1, 'Max file size must be at least 1MB'],
      default: 5 // 5MB
    }
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
settingsSchema.index({}, { unique: true });

export default mongoose.model<ISettings>('Settings', settingsSchema); 