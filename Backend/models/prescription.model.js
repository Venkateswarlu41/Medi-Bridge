const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  prescriptionId: {
    type: String,
    unique: true,
    required: false,
    default: function() {
      // Temporary default, will be replaced by pre-save hook
      return `PRE${Date.now().toString().slice(-6)}`;
    }
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  medicalRecord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicalRecord'
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  prescriptionDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  // Medications prescribed
  medications: [{
    medication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medication',
      required: true
    },
    dosage: {
      amount: {
        type: Number,
        required: true,
        min: 0
      },
      unit: {
        type: String,
        enum: ['mg', 'g', 'ml', 'mcg', 'iu', 'tablet', 'capsule', 'drop', 'tsp', 'tbsp'],
        required: true
      }
    },
    frequency: {
      type: String,
      enum: ['once-daily', 'twice-daily', 'three-times-daily', 'four-times-daily', 'every-6-hours', 'every-8-hours', 'every-12-hours', 'as-needed', 'custom'],
      required: true
    },
    customFrequency: String, // For custom frequency descriptions
    duration: {
      value: {
        type: Number,
        required: true,
        min: 1
      },
      unit: {
        type: String,
        enum: ['days', 'weeks', 'months'],
        required: true
      }
    },
    route: {
      type: String,
      enum: ['oral', 'intravenous', 'intramuscular', 'subcutaneous', 'topical', 'inhalation', 'nasal', 'rectal', 'other'],
      default: 'oral'
    },
    instructions: String,
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    refills: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    }
  }],
  // Prescription details
  diagnosis: String,
  symptoms: String,
  notes: String,
  specialInstructions: String,
  // Status and fulfillment
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled', 'expired'],
    default: 'active'
  },
  pharmacy: {
    dispensedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    dispensedDate: Date,
    dispensedQuantities: [{
      medication: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Medication'
      },
      quantityDispensed: Number,
      batchNumber: String,
      expiryDate: Date
    }]
  },
  // Financial information
  billing: {
    totalAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    items: [{
      medication: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Medication'
      },
      quantity: Number,
      unitPrice: Number,
      totalPrice: Number
    }],
    insuranceCovered: {
      type: Number,
      default: 0,
      min: 0
    },
    patientPayment: {
      type: Number,
      default: 0,
      min: 0
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'partial', 'paid', 'refunded'],
      default: 'pending'
    }
  },
  // Validity and expiry
  validUntil: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Audit trail
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
prescriptionSchema.index({ patient: 1, prescriptionDate: -1 });
prescriptionSchema.index({ doctor: 1, prescriptionDate: -1 });
prescriptionSchema.index({ status: 1 });
prescriptionSchema.index({ prescriptionDate: 1 });
prescriptionSchema.index({ validUntil: 1 });

// Virtual for prescription validity status
prescriptionSchema.virtual('validityStatus').get(function() {
  const now = new Date();
  if (this.validUntil < now) return 'expired';
  if (this.status === 'cancelled') return 'cancelled';
  if (this.status === 'completed') return 'completed';
  return 'valid';
});

// Virtual for total medication count
prescriptionSchema.virtual('totalMedications').get(function() {
  return this.medications.length;
});

// Generate prescription ID before saving
prescriptionSchema.pre('save', async function(next) {
  if (!this.prescriptionId || this.prescriptionId.startsWith('PRE' + Date.now().toString().slice(-6).substring(0, 6))) {
    try {
      const count = await this.constructor.countDocuments();
      const date = new Date();
      const year = date.getFullYear().toString().slice(-2);
      const month = String(date.getMonth() + 1).padStart(2, '0');
      this.prescriptionId = `PRE${year}${month}${String(count + 1).padStart(5, '0')}`;
      console.log('Generated prescriptionId:', this.prescriptionId);
    } catch (error) {
      console.error('Error generating prescriptionId:', error);
      // Fallback ID generation
      const timestamp = Date.now().toString().slice(-6);
      this.prescriptionId = `PRE${timestamp}`;
    }
  }
  
  // Set validity period if not set (default 30 days from creation)
  if (!this.validUntil) {
    this.validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  }
  
  // Calculate total amount
  this.billing.totalAmount = this.medications.reduce((total, med) => {
    const item = this.billing.items.find(item => item.medication.equals(med.medication));
    return total + (item ? item.totalPrice : 0);
  }, 0);
  
  next();
});

// Method to add medication
prescriptionSchema.methods.addMedication = function(medicationData) {
  this.medications.push(medicationData);
  return this.save();
};

// Method to remove medication
prescriptionSchema.methods.removeMedication = function(medicationId) {
  this.medications = this.medications.filter(med => !med.medication.equals(medicationId));
  return this.save();
};

// Method to dispense medication
prescriptionSchema.methods.dispenseMedication = function(dispensedBy, dispensedItems) {
  this.pharmacy.dispensedBy = dispensedBy;
  this.pharmacy.dispensedDate = new Date();
  this.pharmacy.dispensedQuantities = dispensedItems;
  this.status = 'completed';
  return this.save();
};

// Method to cancel prescription
prescriptionSchema.methods.cancel = function(reason) {
  this.status = 'cancelled';
  this.notes = this.notes ? `${this.notes}\nCancelled: ${reason}` : `Cancelled: ${reason}`;
  return this.save();
};

module.exports = mongoose.model('Prescription', prescriptionSchema);