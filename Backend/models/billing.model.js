const mongoose = require('mongoose');

const billingSchema = new mongoose.Schema({
  billId: {
    type: String,
    unique: true,
    required: true
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
  medicalRecord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicalRecord'
  },
  billDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  },
  // Service charges
  services: [{
    serviceType: {
      type: String,
      enum: ['consultation', 'procedure', 'lab-test', 'imaging', 'medication', 'room-charge', 'surgery', 'emergency', 'other'],
      required: true
    },
    serviceName: {
      type: String,
      required: true
    },
    serviceCode: String,
    description: String,
    quantity: {
      type: Number,
      default: 1,
      min: 1
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    },
    discount: {
      type: Number,
      default: 0,
      min: 0
    },
    tax: {
      type: Number,
      default: 0,
      min: 0
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    performedDate: Date
  }],
  // Financial summary
  financials: {
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    totalDiscount: {
      type: Number,
      default: 0,
      min: 0
    },
    totalTax: {
      type: Number,
      default: 0,
      min: 0
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    balanceAmount: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  // Insurance information
  insurance: {
    provider: String,
    policyNumber: String,
    claimNumber: String,
    coveragePercentage: {
      type: Number,
      min: 0,
      max: 100
    },
    approvedAmount: {
      type: Number,
      min: 0
    },
    claimStatus: {
      type: String,
      enum: ['not-submitted', 'submitted', 'approved', 'rejected', 'partially-approved'],
      default: 'not-submitted'
    },
    claimSubmissionDate: Date,
    claimApprovalDate: Date,
    rejectionReason: String
  },
  // Payment information
  payments: [{
    paymentId: String,
    paymentDate: {
      type: Date,
      default: Date.now
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'bank-transfer', 'cheque', 'insurance', 'online', 'upi'],
      required: true
    },
    transactionId: String,
    reference: String,
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'completed'
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String
  }],
  // Bill status
  status: {
    type: String,
    enum: ['draft', 'pending', 'sent', 'paid', 'partially-paid', 'overdue', 'cancelled', 'refunded'],
    default: 'draft'
  },
  // Additional information
  notes: String,
  internalNotes: String,
  // Audit trail
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  sentDate: Date,
  sentBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for payment status
billingSchema.virtual('paymentStatus').get(function() {
  if (this.financials.paidAmount === 0) return 'unpaid';
  if (this.financials.paidAmount >= this.financials.totalAmount) return 'paid';
  return 'partially-paid';
});

// Virtual for days overdue
billingSchema.virtual('daysOverdue').get(function() {
  if (this.status === 'paid') return 0;
  
  const now = new Date();
  const dueDate = new Date(this.dueDate);
  const diffTime = now - dueDate;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays > 0 ? diffDays : 0;
});

// Indexes for better performance
// billId index is already created by unique: true in schema
billingSchema.index({ patient: 1, billDate: -1 });
billingSchema.index({ status: 1 });
billingSchema.index({ dueDate: 1 });
billingSchema.index({ 'insurance.claimStatus': 1 });

// Generate bill ID before saving
billingSchema.pre('save', async function(next) {
  if (!this.billId) {
    const count = await this.constructor.countDocuments();
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    this.billId = `BILL${year}${month}${String(count + 1).padStart(5, '0')}`;
  }
  
  // Calculate balance amount
  this.financials.balanceAmount = this.financials.totalAmount - this.financials.paidAmount;
  
  // Set due date if not provided (30 days from bill date)
  if (!this.dueDate) {
    this.dueDate = new Date(this.billDate.getTime() + (30 * 24 * 60 * 60 * 1000));
  }
  
  next();
});

// Method to add payment
billingSchema.methods.addPayment = function(paymentData, processedBy) {
  const payment = {
    ...paymentData,
    processedBy,
    paymentDate: new Date()
  };
  
  this.payments.push(payment);
  this.financials.paidAmount += paymentData.amount;
  this.financials.balanceAmount = this.financials.totalAmount - this.financials.paidAmount;
  
  // Update status based on payment
  if (this.financials.paidAmount >= this.financials.totalAmount) {
    this.status = 'paid';
  } else if (this.financials.paidAmount > 0) {
    this.status = 'partially-paid';
  }
  
  return this.save();
};

// Method to calculate totals
billingSchema.methods.calculateTotals = function() {
  let subtotal = 0;
  let totalDiscount = 0;
  let totalTax = 0;
  
  this.services.forEach(service => {
    subtotal += service.totalPrice;
    totalDiscount += service.discount || 0;
    totalTax += service.tax || 0;
  });
  
  this.financials.subtotal = subtotal;
  this.financials.totalDiscount = totalDiscount;
  this.financials.totalTax = totalTax;
  this.financials.totalAmount = subtotal - totalDiscount + totalTax;
  this.financials.balanceAmount = this.financials.totalAmount - this.financials.paidAmount;
  
  return this;
};

module.exports = mongoose.model('Billing', billingSchema);