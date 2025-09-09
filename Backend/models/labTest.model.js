const mongoose = require('mongoose');

const labTestSchema = new mongoose.Schema({
  testId: {
    type: String,
    unique: true,
    required: false,
    default: function() {
      // Temporary default, will be replaced by pre-save hook
      return `LAB${Date.now().toString().slice(-6)}`;
    }
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
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
  assignedTechnician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  testName: {
    type: String,
    required: true,
    maxlength: 200
  },
  testType: {
    type: String,
    enum: ['blood', 'urine', 'imaging', 'pathology', 'microbiology', 'biochemistry', 'hematology', 'other'],
    required: true
  },
  priority: {
    type: String,
    enum: ['routine', 'urgent', 'stat'],
    default: 'routine'
  },
  status: {
    type: String,
    enum: ['requested', 'assigned', 'in-progress', 'completed', 'cancelled', 'reviewed'],
    default: 'requested'
  },
  // Test Request Details
  requestDate: {
    type: Date,
    default: Date.now
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  clinicalIndication: {
    type: String,
    maxlength: 500
  },
  specialInstructions: {
    type: String,
    maxlength: 500
  },
  // Test Execution
  assignedDate: Date,
  startedDate: Date,
  completedDate: Date,
  // Test Results
  results: {
    values: [{
      parameter: String,
      value: String,
      unit: String,
      normalRange: String,
      status: {
        type: String,
        enum: ['normal', 'abnormal', 'critical', 'inconclusive']
      }
    }],
    interpretation: String,
    conclusion: String,
    recommendations: String,
    attachments: [{
      filename: String,
      originalName: String,
      path: String,
      mimeType: String,
      size: Number,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  // Quality Control
  qualityControl: {
    verified: {
      type: Boolean,
      default: false
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: Date,
    comments: String
  },
  // Doctor Review
  doctorReview: {
    reviewed: {
      type: Boolean,
      default: false
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date,
    comments: String,
    actionTaken: String
  },
  // Billing Information
  billing: {
    cost: Number,
    covered: {
      type: Boolean,
      default: false
    },
    insuranceClaim: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
labTestSchema.index({ appointment: 1 });
labTestSchema.index({ patient: 1, requestDate: -1 });
labTestSchema.index({ assignedTechnician: 1, status: 1 });
labTestSchema.index({ doctor: 1, status: 1 });
labTestSchema.index({ status: 1, priority: 1 });
labTestSchema.index({ testType: 1 });

// Generate test ID before saving
labTestSchema.pre('save', async function(next) {
  if (!this.testId) {
    try {
      const count = await this.constructor.countDocuments();
      const date = new Date();
      const year = date.getFullYear().toString().slice(-2);
      const month = String(date.getMonth() + 1).padStart(2, '0');
      this.testId = `LAB${year}${month}${String(count + 1).padStart(5, '0')}`;
      console.log('Generated testId:', this.testId);
    } catch (error) {
      console.error('Error generating testId:', error);
      // Fallback ID generation
      const timestamp = Date.now().toString().slice(-6);
      this.testId = `LAB${timestamp}`;
    }
  }
  next();
});

// Method to assign technician
labTestSchema.methods.assignTechnician = function(technicianId) {
  this.assignedTechnician = technicianId;
  this.status = 'assigned';
  this.assignedDate = new Date();
  return this.save();
};

// Method to start test
labTestSchema.methods.startTest = function() {
  this.status = 'in-progress';
  this.startedDate = new Date();
  return this.save();
};

// Method to complete test
labTestSchema.methods.completeTest = function(results) {
  this.status = 'completed';
  this.completedDate = new Date();
  this.results = { ...this.results, ...results };
  return this.save();
};

// Method to review test
labTestSchema.methods.reviewTest = function(doctorId, comments, actionTaken) {
  this.doctorReview = {
    reviewed: true,
    reviewedBy: doctorId,
    reviewedAt: new Date(),
    comments,
    actionTaken
  };
  this.status = 'reviewed';
  return this.save();
};

// Virtual for test duration
labTestSchema.virtual('duration').get(function() {
  if (this.startedDate && this.completedDate) {
    return Math.round((this.completedDate - this.startedDate) / (1000 * 60)); // in minutes
  }
  return null;
});

// Virtual for turnaround time
labTestSchema.virtual('turnaroundTime').get(function() {
  if (this.requestDate && this.completedDate) {
    return Math.round((this.completedDate - this.requestDate) / (1000 * 60 * 60)); // in hours
  }
  return null;
});

module.exports = mongoose.model('LabTest', labTestSchema);