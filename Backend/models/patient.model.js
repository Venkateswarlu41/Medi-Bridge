const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  patientId: {
    type: String,
    unique: true
    // Note: We don't set required: true here because we generate it in pre-save hook
  },
  // Insurance Information
  insurance: {
    provider: String,
    policyNumber: String,
    groupNumber: String,
    subscriberName: String,
    relationship: {
      type: String,
      enum: ['self', 'spouse', 'child', 'parent', 'other'],
      default: 'self'
    },
    effectiveDate: Date,
    expirationDate: Date,
    copay: Number,
    deductible: Number
  },
  // Medical History
  medicalHistory: {
    previousSurgeries: [{
      procedure: String,
      date: Date,
      hospital: String,
      surgeon: String,
      notes: String
    }],
    familyHistory: [{
      relationship: String,
      condition: String,
      ageOfOnset: Number,
      notes: String
    }],
    socialHistory: {
      smoking: {
        status: {
          type: String,
          enum: ['never', 'former', 'current']
        },
        packsPerDay: Number,
        yearsSmoked: Number,
        quitDate: Date
      },
      alcohol: {
        status: {
          type: String,
          enum: ['never', 'occasional', 'regular', 'heavy']
        },
        drinksPerWeek: Number
      },
      exercise: {
        frequency: String,
        type: String,
        duration: String
      },
      occupation: String,
      maritalStatus: {
        type: String,
        enum: ['single', 'married', 'divorced', 'widowed', 'separated']
      }
    }
  },
  // Vital Signs History
  vitalSigns: [{
    date: {
      type: Date,
      default: Date.now
    },
    height: Number, // in cm
    weight: Number, // in kg
    bmi: Number,
    bloodPressure: {
      systolic: Number,
      diastolic: Number
    },
    heartRate: Number, // bpm
    temperature: Number, // in Celsius
    respiratoryRate: Number, // breaths per minute
    oxygenSaturation: Number, // percentage
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  // Current Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'deceased', 'transferred'],
    default: 'active'
  },
  primaryPhysician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Preferences
  preferences: {
    preferredLanguage: String,
    communicationMethod: {
      type: String,
      enum: ['email', 'phone', 'sms', 'mail'],
      default: 'email'
    },
    appointmentReminders: {
      type: Boolean,
      default: true
    },
    marketingCommunications: {
      type: Boolean,
      default: false
    }
  },
  // Notes and Comments
  notes: [{
    content: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['general', 'medical', 'administrative', 'billing'],
      default: 'general'
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for current BMI
patientSchema.virtual('currentBMI').get(function() {
  if (this.vitalSigns && this.vitalSigns.length > 0) {
    const latest = this.vitalSigns[this.vitalSigns.length - 1];
    if (latest.height && latest.weight) {
      const heightInM = latest.height / 100;
      return (latest.weight / (heightInM * heightInM)).toFixed(1);
    }
  }
  return null;
});

// Virtual for latest vital signs
patientSchema.virtual('latestVitalSigns').get(function() {
  if (this.vitalSigns && this.vitalSigns.length > 0) {
    return this.vitalSigns[this.vitalSigns.length - 1];
  }
  return null;
});

// Indexes for better performance
// Note: These indexes are already created by unique: true property
// patientSchema.index({ patientId: 1 }); // Already created by unique: true
// patientSchema.index({ user: 1 }); // Already created by unique: true
patientSchema.index({ primaryPhysician: 1 });
patientSchema.index({ status: 1 });
patientSchema.index({ 'insurance.provider': 1 });

// Add validation to ensure patientId is always set
patientSchema.path('patientId').validate(function(value) {
  return value && value.length > 0;
}, 'Patient ID is required');

// Generate patient ID before saving
patientSchema.pre('save', async function(next) {
  if (!this.patientId) {
    try {
      // Generate a timestamp-based patient ID to ensure uniqueness
      const timestamp = Date.now();
      const randomNum = Math.floor(Math.random() * 1000);
      
      // Try to find the last patient to get the next sequential number
      let nextNumber = 1;
      try {
        const lastPatient = await mongoose.model('Patient').findOne({}, {}, { sort: { 'createdAt': -1 } });
        if (lastPatient && lastPatient.patientId) {
          // Extract number from last patient ID (format: PAT000001)
          const lastNumber = parseInt(lastPatient.patientId.replace('PAT', ''));
          if (!isNaN(lastNumber)) {
            nextNumber = lastNumber + 1;
          }
        }
      } catch (queryError) {
        console.log('Could not query existing patients, using timestamp-based ID');
        // Fallback to timestamp-based ID if query fails
        nextNumber = Math.floor(timestamp / 1000); // Use timestamp as base number
      }
      
      // Generate patient ID with fallback
      let patientId;
      let attempts = 0;
      const maxAttempts = 5;
      
      while (attempts < maxAttempts) {
        if (attempts === 0) {
          patientId = `PAT${String(nextNumber).padStart(6, '0')}`;
        } else {
          // Add random component for subsequent attempts
          patientId = `PAT${String(nextNumber + attempts + randomNum).padStart(6, '0')}`;
        }
        
        // Check if this ID already exists
        const existingPatient = await mongoose.model('Patient').findOne({ patientId });
        if (!existingPatient) {
          this.patientId = patientId;
          break;
        }
        
        attempts++;
      }
      
      // Final fallback - use timestamp if all attempts failed
      if (!this.patientId) {
        this.patientId = `PAT${String(timestamp).slice(-6)}`;
      }
    } catch (error) {
      console.error('Error generating patient ID:', error);
      // Final fallback - use timestamp-based ID
      this.patientId = `PAT${String(Date.now()).slice(-6)}`;
    }
  }
  
  // Ensure patientId is set before saving
  if (!this.patientId) {
    return next(new Error('Failed to generate patient ID'));
  }
  
  next();
});

// Method to add vital signs
patientSchema.methods.addVitalSigns = function(vitalData, recordedBy) {
  const vitalSigns = {
    ...vitalData,
    recordedBy,
    date: new Date()
  };
  
  // Calculate BMI if height and weight are provided
  if (vitalSigns.height && vitalSigns.weight) {
    const heightInM = vitalSigns.height / 100;
    vitalSigns.bmi = (vitalSigns.weight / (heightInM * heightInM)).toFixed(1);
  }
  
  this.vitalSigns.push(vitalSigns);
  return this.save();
};

// Method to add note
patientSchema.methods.addNote = function(content, createdBy, type = 'general') {
  this.notes.push({
    content,
    createdBy,
    type,
    createdAt: new Date()
  });
  return this.save();
};

module.exports = mongoose.model('Patient', patientSchema);