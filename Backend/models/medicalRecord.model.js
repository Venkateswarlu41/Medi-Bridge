const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  recordId: {
    type: String,
    unique: true,
    required: false,
    default: function() {
      // Temporary default, will be replaced by pre-save hook
      return `MR${Date.now().toString().slice(-6)}`;
    }
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  recordType: {
    type: String,
    enum: ['consultation', 'lab-result', 'imaging', 'procedure', 'discharge-summary', 'prescription', 'vaccination'],
    required: true
  },
  recordDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  // Clinical Information
  chiefComplaint: String,
  historyOfPresentIllness: String,
  physicalExamination: {
    general: String,
    vitalSigns: {
      bloodPressure: {
        systolic: Number,
        diastolic: Number
      },
      heartRate: Number,
      temperature: Number,
      respiratoryRate: Number,
      oxygenSaturation: Number,
      weight: Number,
      height: Number,
      bmi: Number
    },
    systemicExamination: {
      cardiovascular: String,
      respiratory: String,
      gastrointestinal: String,
      neurological: String,
      musculoskeletal: String,
      dermatological: String,
      other: String
    }
  },
  // Diagnosis
  diagnosis: {
    primary: [{
      code: String, // ICD-10 code
      description: String,
      severity: {
        type: String,
        enum: ['mild', 'moderate', 'severe', 'critical']
      }
    }],
    secondary: [{
      code: String,
      description: String,
      severity: {
        type: String,
        enum: ['mild', 'moderate', 'severe', 'critical']
      }
    }],
    differential: [String]
  },
  // Treatment and Management
  treatment: {
    medications: [{
      name: String,
      genericName: String,
      dosage: String,
      frequency: String,
      duration: String,
      route: {
        type: String,
        enum: ['oral', 'intravenous', 'intramuscular', 'subcutaneous', 'topical', 'inhalation', 'other']
      },
      instructions: String,
      prescribedDate: {
        type: Date,
        default: Date.now
      }
    }],
    procedures: [{
      name: String,
      code: String, // CPT code
      description: String,
      performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      performedDate: Date,
      location: String,
      outcome: String,
      complications: String
    }],
    therapies: [{
      type: String,
      description: String,
      frequency: String,
      duration: String,
      provider: String
    }]
  },
  // Lab Results
  labResults: [{
    testName: String,
    testCode: String,
    result: String,
    normalRange: String,
    unit: String,
    status: {
      type: String,
      enum: ['normal', 'abnormal', 'critical', 'pending']
    },
    performedDate: Date,
    reportedDate: Date,
    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String
  }],
  // Imaging Results
  imagingResults: [{
    studyType: String,
    studyDate: Date,
    findings: String,
    impression: String,
    radiologist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    images: [{
      filename: String,
      path: String,
      uploadDate: Date
    }]
  }],
  // Follow-up and Care Plan
  carePlan: {
    followUpDate: Date,
    followUpInstructions: String,
    dietaryRecommendations: String,
    activityRestrictions: String,
    warningSignsToWatch: [String],
    nextAppointmentRecommended: Boolean,
    referrals: [{
      specialty: String,
      doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      reason: String,
      urgency: {
        type: String,
        enum: ['routine', 'urgent', 'stat']
      }
    }]
  },
  // Documents and Attachments
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    mimeType: String,
    size: Number,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    description: String
  }],
  // Record Status and Metadata
  status: {
    type: String,
    enum: ['draft', 'completed', 'reviewed', 'amended', 'archived'],
    default: 'draft'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  // Billing Information
  billing: {
    consultationFee: Number,
    procedureFees: [{
      procedure: String,
      fee: Number
    }],
    labFees: [{
      test: String,
      fee: Number
    }],
    totalAmount: Number,
    insuranceCovered: Number,
    patientResponsibility: Number
  },
  // Notes and Comments
  notes: String,
  privateNotes: String, // Only visible to the creating doctor
  // Audit Trail
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  amendments: [{
    amendedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    amendedAt: Date,
    reason: String,
    changes: String
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
// recordId index is already created by unique: true in schema
medicalRecordSchema.index({ patient: 1, recordDate: -1 });
medicalRecordSchema.index({ doctor: 1, recordDate: -1 });
medicalRecordSchema.index({ appointment: 1 });
medicalRecordSchema.index({ recordType: 1 });
medicalRecordSchema.index({ status: 1 });

// Generate record ID before saving
medicalRecordSchema.pre('save', async function(next) {
  if (!this.recordId || this.recordId.startsWith('MR' + Date.now().toString().slice(-6).substring(0, 6))) {
    try {
      const count = await this.constructor.countDocuments();
      const date = new Date();
      const year = date.getFullYear().toString().slice(-2);
      const month = String(date.getMonth() + 1).padStart(2, '0');
      this.recordId = `MR${year}${month}${String(count + 1).padStart(5, '0')}`;
      console.log('Generated recordId:', this.recordId);
    } catch (error) {
      console.error('Error generating recordId:', error);
      // Fallback ID generation
      const timestamp = Date.now().toString().slice(-6);
      this.recordId = `MR${timestamp}`;
    }
  }
  next();
});

// Method to add amendment
medicalRecordSchema.methods.addAmendment = function(amendedBy, reason, changes) {
  this.amendments.push({
    amendedBy,
    amendedAt: new Date(),
    reason,
    changes
  });
  this.lastModifiedBy = amendedBy;
  return this.save();
};

// Method to add attachment
medicalRecordSchema.methods.addAttachment = function(fileData, uploadedBy) {
  this.attachments.push({
    ...fileData,
    uploadedBy,
    uploadedAt: new Date()
  });
  return this.save();
};

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);