const Billing = require('../models/billing.model');
const User = require('../models/user.model');
const { validationResult } = require('express-validator');

// Get all bills
const getAllBills = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      patientId, 
      paymentStatus,
      dateFrom,
      dateTo 
    } = req.query;
    
    const skip = (page - 1) * limit;
    
    // Build query based on user role
    let query = {};
    
    if (req.user.role === 'patient') {
      query.patient = req.user._id;
    }
    
    // Apply filters
    if (status) query.status = status;
    if (patientId && req.user.role !== 'patient') query.patient = patientId;
    
    if (dateFrom || dateTo) {
      query.billDate = {};
      if (dateFrom) query.billDate.$gte = new Date(dateFrom);
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setDate(endDate.getDate() + 1);
        query.billDate.$lt = endDate;
      }
    }
    
    const bills = await Billing.find(query)
      .populate('patient', 'firstName lastName email phone')
      .populate('appointment', 'appointmentDate appointmentTime type')
      .populate('createdBy', 'firstName lastName')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ billDate: -1 });
    
    // Filter by payment status if specified
    let filteredBills = bills;
    if (paymentStatus) {
      filteredBills = bills.filter(bill => bill.paymentStatus === paymentStatus);
    }
    
    const total = await Billing.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        bills: filteredBills,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get bills error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bills',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get bill by ID
const getBillById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const bill = await Billing.findById(id)
      .populate('patient', 'firstName lastName email phone address')
      .populate('appointment', 'appointmentDate appointmentTime type chiefComplaint')
      .populate('medicalRecord', 'recordDate diagnosis')
      .populate('createdBy', 'firstName lastName')
      .populate('payments.processedBy', 'firstName lastName');
    
    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }
    
    // Check access permissions
    if (req.user.role === 'patient' && bill.patient._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    res.json({
      success: true,
      data: { bill }
    });
  } catch (error) {
    console.error('Get bill error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bill',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Create new bill
const createBill = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const {
      patientId,
      appointmentId,
      medicalRecordId,
      services,
      dueDate,
      notes
    } = req.body;
    
    // Verify patient exists
    const patient = await User.findById(patientId);
    if (!patient || patient.role !== 'patient') {
      return res.status(400).json({
        success: false,
        message: 'Invalid patient selected'
      });
    }
    
    // Create bill
    const bill = new Billing({
      patient: patientId,
      appointment: appointmentId,
      medicalRecord: medicalRecordId,
      services,
      dueDate,
      notes,
      createdBy: req.user._id
    });
    
    // Calculate totals
    bill.calculateTotals();
    
    await bill.save();
    
    // Populate the created bill
    await bill.populate([
      { path: 'patient', select: 'firstName lastName email phone' },
      { path: 'appointment', select: 'appointmentDate appointmentTime type' },
      { path: 'createdBy', select: 'firstName lastName' }
    ]);
    
    res.status(201).json({
      success: true,
      message: 'Bill created successfully',
      data: { bill }
    });
  } catch (error) {
    console.error('Create bill error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create bill',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update bill
const updateBill = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { id } = req.params;
    const updateData = {
      ...req.body,
      lastModifiedBy: req.user._id
    };
    
    const bill = await Billing.findById(id);
    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }
    
    // Don't allow updates to paid bills
    if (bill.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update a paid bill'
      });
    }
    
    // Update bill
    Object.assign(bill, updateData);
    
    // Recalculate totals if services were updated
    if (updateData.services) {
      bill.calculateTotals();
    }
    
    await bill.save();
    
    await bill.populate([
      { path: 'patient', select: 'firstName lastName email phone' },
      { path: 'appointment', select: 'appointmentDate appointmentTime type' },
      { path: 'createdBy', select: 'firstName lastName' }
    ]);
    
    res.json({
      success: true,
      message: 'Bill updated successfully',
      data: { bill }
    });
  } catch (error) {
    console.error('Update bill error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update bill',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Process payment
const processPayment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { id } = req.params;
    const paymentData = req.body;
    
    const bill = await Billing.findById(id);
    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }
    
    // Check if payment amount is valid
    if (paymentData.amount > bill.financials.balanceAmount) {
      return res.status(400).json({
        success: false,
        message: 'Payment amount exceeds balance amount'
      });
    }
    
    // Add payment
    await bill.addPayment(paymentData, req.user._id);
    
    await bill.populate([
      { path: 'patient', select: 'firstName lastName email phone' },
      { path: 'payments.processedBy', select: 'firstName lastName' }
    ]);
    
    res.json({
      success: true,
      message: 'Payment processed successfully',
      data: { 
        bill,
        payment: bill.payments[bill.payments.length - 1]
      }
    });
  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process payment',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get billing summary
const getBillingSummary = async (req, res) => {
  try {
    const { period = 'month', year, month } = req.query;
    
    let matchStage = {};
    
    // Build date filter
    if (period === 'month' && year && month) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      matchStage.billDate = { $gte: startDate, $lte: endDate };
    } else if (period === 'year' && year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31);
      matchStage.billDate = { $gte: startDate, $lte: endDate };
    }
    
    const summary = await Billing.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalBills: { $sum: 1 },
          totalAmount: { $sum: '$financials.totalAmount' },
          totalPaid: { $sum: '$financials.paidAmount' },
          totalPending: { $sum: '$financials.balanceAmount' },
          paidBills: {
            $sum: {
              $cond: [{ $eq: ['$status', 'paid'] }, 1, 0]
            }
          },
          pendingBills: {
            $sum: {
              $cond: [{ $in: ['$status', ['pending', 'sent']] }, 1, 0]
            }
          },
          overdueBills: {
            $sum: {
              $cond: [{ $eq: ['$status', 'overdue'] }, 1, 0]
            }
          }
        }
      }
    ]);
    
    // Get payment method breakdown
    const paymentMethods = await Billing.aggregate([
      { $match: matchStage },
      { $unwind: '$payments' },
      {
        $group: {
          _id: '$payments.paymentMethod',
          count: { $sum: 1 },
          totalAmount: { $sum: '$payments.amount' }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);
    
    res.json({
      success: true,
      data: {
        summary: summary[0] || {
          totalBills: 0,
          totalAmount: 0,
          totalPaid: 0,
          totalPending: 0,
          paidBills: 0,
          pendingBills: 0,
          overdueBills: 0
        },
        paymentMethods,
        period: { period, year, month }
      }
    });
  } catch (error) {
    console.error('Get billing summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate billing summary',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get overdue bills
const getOverdueBills = async (req, res) => {
  try {
    const today = new Date();
    
    const overdueBills = await Billing.find({
      dueDate: { $lt: today },
      status: { $in: ['pending', 'sent', 'partially-paid'] },
      'financials.balanceAmount': { $gt: 0 }
    })
    .populate('patient', 'firstName lastName email phone')
    .populate('createdBy', 'firstName lastName')
    .sort({ dueDate: 1 });
    
    res.json({
      success: true,
      data: {
        count: overdueBills.length,
        bills: overdueBills
      }
    });
  } catch (error) {
    console.error('Get overdue bills error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch overdue bills',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  getAllBills,
  getBillById,
  createBill,
  updateBill,
  processPayment,
  getBillingSummary,
  getOverdueBills
};