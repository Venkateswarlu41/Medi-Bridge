const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Department name is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Department name cannot exceed 100 characters']
  },
  code: {
    type: String,
    required: [true, 'Department code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: [10, 'Department code cannot exceed 10 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  head: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  location: {
    building: String,
    floor: String,
    wing: String,
    roomNumbers: [String]
  },
  contactInfo: {
    phone: String,
    email: String,
    extension: String
  },
  operatingHours: {
    monday: {
      isOpen: { type: Boolean, default: true },
      openTime: String,
      closeTime: String
    },
    tuesday: {
      isOpen: { type: Boolean, default: true },
      openTime: String,
      closeTime: String
    },
    wednesday: {
      isOpen: { type: Boolean, default: true },
      openTime: String,
      closeTime: String
    },
    thursday: {
      isOpen: { type: Boolean, default: true },
      openTime: String,
      closeTime: String
    },
    friday: {
      isOpen: { type: Boolean, default: true },
      openTime: String,
      closeTime: String
    },
    saturday: {
      isOpen: { type: Boolean, default: false },
      openTime: String,
      closeTime: String
    },
    sunday: {
      isOpen: { type: Boolean, default: false },
      openTime: String,
      closeTime: String
    }
  },
  services: [String],
  equipment: [{
    name: String,
    model: String,
    serialNumber: String,
    status: {
      type: String,
      enum: ['operational', 'maintenance', 'out-of-order'],
      default: 'operational'
    },
    lastMaintenance: Date,
    nextMaintenance: Date
  }],
  budget: {
    allocated: Number,
    spent: Number,
    remaining: Number
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for staff count
departmentSchema.virtual('staffCount', {
  ref: 'User',
  localField: '_id',
  foreignField: 'department',
  count: true
});

// Indexes
// Note: These indexes are already created by unique: true property
// departmentSchema.index({ name: 1 }); // Already created by unique: true
// departmentSchema.index({ code: 1 }); // Already created by unique: true
departmentSchema.index({ isActive: 1 });

module.exports = mongoose.model('Department', departmentSchema);