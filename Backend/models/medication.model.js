const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
  medicationId: {
    type: String,
    unique: true
    // Note: We don't set required: true here because we generate it in pre-save hook
  },
  name: {
    type: String,
    required: [true, 'Medication name is required'],
    trim: true
  },
  genericName: {
    type: String,
    trim: true
  },
  brandName: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['antibiotic', 'analgesic', 'antihypertensive', 'antidiabetic', 'antihistamine', 'antacid', 'vitamin', 'supplement', 'other'],
    required: true
  },
  dosageForm: {
    type: String,
    enum: ['tablet', 'capsule', 'syrup', 'injection', 'cream', 'ointment', 'drops', 'inhaler', 'patch'],
    required: true
  },
  strength: {
    value: Number,
    unit: {
      type: String,
      enum: ['mg', 'g', 'ml', 'mcg', 'iu', '%']
    }
  },
  manufacturer: {
    name: String,
    batchNumber: String,
    manufacturingDate: Date,
    expiryDate: Date
  },
  inventory: {
    currentStock: {
      type: Number,
      default: 0,
      min: 0
    },
    minimumStock: {
      type: Number,
      default: 10,
      min: 0
    },
    maximumStock: {
      type: Number,
      default: 1000,
      min: 0
    },
    reorderLevel: {
      type: Number,
      default: 20,
      min: 0
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },
    sellingPrice: {
      type: Number,
      required: true,
      min: 0
    }
  },
  storage: {
    location: String,
    temperature: {
      min: Number,
      max: Number,
      unit: {
        type: String,
        enum: ['celsius', 'fahrenheit'],
        default: 'celsius'
      }
    },
    humidity: {
      min: Number,
      max: Number
    },
    specialInstructions: String
  },
  prescriptionInfo: {
    isPrescriptionRequired: {
      type: Boolean,
      default: true
    },
    controlledSubstance: {
      type: Boolean,
      default: false
    },
    schedule: {
      type: String,
      enum: ['I', 'II', 'III', 'IV', 'V']
    }
  },
  sideEffects: [String],
  contraindications: [String],
  interactions: [String],
  dosageInstructions: {
    adult: String,
    pediatric: String,
    elderly: String,
    special: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for stock status
medicationSchema.virtual('stockStatus').get(function() {
  if (this.inventory.currentStock <= 0) return 'out-of-stock';
  if (this.inventory.currentStock <= this.inventory.reorderLevel) return 'low-stock';
  if (this.inventory.currentStock <= this.inventory.minimumStock) return 'minimum-stock';
  return 'in-stock';
});

// Virtual for expiry status
medicationSchema.virtual('expiryStatus').get(function() {
  if (!this.manufacturer.expiryDate) return 'unknown';
  
  const now = new Date();
  const expiryDate = new Date(this.manufacturer.expiryDate);
  const daysToExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
  
  if (daysToExpiry < 0) return 'expired';
  if (daysToExpiry <= 30) return 'expiring-soon';
  if (daysToExpiry <= 90) return 'expiring-in-3-months';
  return 'good';
});

// Indexes
// Note: medicationId index is already created by unique: true property
// medicationSchema.index({ medicationId: 1 }); // Already created by unique: true
medicationSchema.index({ name: 1 });
medicationSchema.index({ category: 1 });
medicationSchema.index({ 'inventory.currentStock': 1 });
medicationSchema.index({ isActive: 1 });

// Generate medication ID before saving
medicationSchema.pre('save', async function(next) {
  if (!this.medicationId) {
    try {
      // Get count of existing medications to generate next ID
      const count = await mongoose.model('Medication').countDocuments();
      this.medicationId = `MED${String(count + 1).padStart(6, '0')}`;
    } catch (error) {
      console.error('Error generating medication ID:', error);
      // Fallback to timestamp-based ID
      this.medicationId = `MED${String(Date.now()).slice(-6)}`;
    }
  }
  
  // Ensure medicationId is set before saving
  if (!this.medicationId) {
    return next(new Error('Failed to generate medication ID'));
  }
  
  next();
});

// Method to update stock
medicationSchema.methods.updateStock = function(quantity, type = 'add') {
  if (type === 'add') {
    this.inventory.currentStock += quantity;
  } else if (type === 'subtract') {
    this.inventory.currentStock = Math.max(0, this.inventory.currentStock - quantity);
  } else if (type === 'set') {
    this.inventory.currentStock = Math.max(0, quantity);
  }
  return this.save();
};

module.exports = mongoose.model('Medication', medicationSchema);