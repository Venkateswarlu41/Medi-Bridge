const Prescription = require('../models/prescription.model');
const Medication = require('../models/medication.model');
const User = require('../models/user.model');
const Appointment = require('../models/appointment.model');
const { validationResult } = require('express-validator');

// Get all prescriptions
const getAllPrescriptions = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      patientId, 
      doctorId,
      startDate,
      endDate 
    } = req.query;
    
    const skip = (page - 1) * limit;
    
    // Build query based on user role
    let query = {};
    
    if (req.user.role === 'patient') {
      query.patient = req.user._id;
    } else if (req.user.role === 'doctor') {
      query.doctor = req.user._id;
    }
    
    // Apply filters
    if (status) query.status = status;
    if (patientId && req.user.role !== 'patient') query.patient = patientId;
    if (doctorId && req.user.role === 'admin') query.doctor = doctorId;
    
    if (startDate || endDate) {
      query.prescriptionDate = {};
      if (startDate) query.prescriptionDate.$gte = new Date(startDate);
      if (endDate) query.prescriptionDate.$lte = new Date(endDate);
    }
    
    const prescriptions = await Prescription.find(query)
      .populate('patient', 'firstName lastName email phone')
      .populate('doctor', 'firstName lastName specialization')
      .populate('appointment', 'appointmentId appointmentDate')
      .populate('department', 'name code')
      .populate('medications.medication', 'name genericName category dosageForm inventory.sellingPrice')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ prescriptionDate: -1 });
    
    const total = await Prescription.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        prescriptions,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get prescriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch prescriptions',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get prescription by ID
const getPrescriptionById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const prescription = await Prescription.findById(id)
      .populate('patient', 'firstName lastName email phone dateOfBirth gender address')
      .populate('doctor', 'firstName lastName specialization licenseNumber')
      .populate('appointment', 'appointmentId appointmentDate appointmentTime chiefComplaint')
      .populate('department', 'name code location')
      .populate('medications.medication', 'name genericName brandName category dosageForm strength inventory')
      .populate('createdBy', 'firstName lastName')
      .populate('pharmacy.dispensedBy', 'firstName lastName');
    
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }
    
    // Check access permissions
    if (req.user.role === 'patient' && prescription.patient._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    if (req.user.role === 'doctor' && prescription.doctor._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    res.json({
      success: true,
      data: { prescription }
    });
  } catch (error) {
    console.error('Get prescription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch prescription',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Create prescription
const createPrescription = async (req, res) => {
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
      diagnosis,
      symptoms,
      notes,
      specialInstructions,
      medications,
      validityDays = 30
    } = req.body;
    
    console.log('Creating prescription with data:', {
      patientId,
      appointmentId,
      diagnosis,
      symptoms,
      medications: medications?.length
    });
    
    // Verify patient exists
    const patient = await User.findById(patientId);
    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }
    
    // Verify appointment if provided
    let appointment = null;
    if (appointmentId) {
      appointment = await Appointment.findById(appointmentId).populate('department');
      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found'
        });
      }
      
      // Verify doctor has access to this appointment
      if (appointment.doctor.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this appointment'
        });
      }
    }
    
    // Get doctor's department
    const doctor = await User.findById(req.user._id).populate('department');
    const departmentId = appointment?.department?._id || doctor.department?._id;
    
    if (!departmentId) {
      return res.status(400).json({
        success: false,
        message: 'Department information is required'
      });
    }
    
    // Validate and process medications
    const processedMedications = [];
    const billingItems = [];
    
    for (const med of medications) {
      const medication = await Medication.findById(med.medicationId);
      if (!medication) {
        return res.status(404).json({
          success: false,
          message: `Medication not found: ${med.medicationId}`
        });
      }
      
      // Check stock availability
      if (medication.inventory.currentStock < med.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${medication.name}. Available: ${medication.inventory.currentStock}, Required: ${med.quantity}`
        });
      }
      
      processedMedications.push({
        medication: medication._id,
        dosage: {
          amount: med.dosage.amount,
          unit: med.dosage.unit
        },
        frequency: med.frequency,
        customFrequency: med.customFrequency,
        duration: {
          value: med.duration.value,
          unit: med.duration.unit
        },
        route: med.route || 'oral',
        instructions: med.instructions,
        quantity: med.quantity,
        refills: med.refills || 0
      });
      
      billingItems.push({
        medication: medication._id,
        quantity: med.quantity,
        unitPrice: medication.inventory.sellingPrice,
        totalPrice: medication.inventory.sellingPrice * med.quantity
      });
    }
    
    const prescription = new Prescription({
      patient: patientId,
      doctor: req.user._id,
      appointment: appointmentId,
      department: departmentId,
      diagnosis,
      symptoms,
      notes,
      specialInstructions,
      medications: processedMedications,
      billing: {
        items: billingItems
      },
      validUntil: new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000),
      createdBy: req.user._id
    });
    
    await prescription.save();
    
    // Populate the created prescription
    await prescription.populate([
      { path: 'patient', select: 'firstName lastName email phone' },
      { path: 'doctor', select: 'firstName lastName specialization' },
      { path: 'appointment', select: 'appointmentId appointmentDate' },
      { path: 'department', select: 'name code' },
      { path: 'medications.medication', select: 'name genericName category dosageForm inventory.sellingPrice' }
    ]);
    
    res.status(201).json({
      success: true,
      message: 'Prescription created successfully',
      data: { prescription }
    });
  } catch (error) {
    console.error('Create prescription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create prescription',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update prescription
const updatePrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const prescription = await Prescription.findById(id);
    
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }
    
    // Only the creating doctor can update
    if (prescription.doctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the prescribing doctor can update this prescription'
      });
    }
    
    // Prevent updates to completed or cancelled prescriptions
    if (['completed', 'cancelled'].includes(prescription.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update completed or cancelled prescriptions'
      });
    }
    
    // Update fields
    Object.keys(updateData).forEach(key => {
      if (key !== '_id' && key !== 'prescriptionId') {
        prescription[key] = updateData[key];
      }
    });
    
    prescription.lastModifiedBy = req.user._id;
    
    await prescription.save();
    
    res.json({
      success: true,
      message: 'Prescription updated successfully',
      data: { prescription }
    });
  } catch (error) {
    console.error('Update prescription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update prescription',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Cancel prescription
const cancelPrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const prescription = await Prescription.findById(id);
    
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }
    
    // Only the creating doctor or admin can cancel
    if (prescription.doctor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    await prescription.cancel(reason || 'Cancelled by doctor');
    
    res.json({
      success: true,
      message: 'Prescription cancelled successfully',
      data: { prescription }
    });
  } catch (error) {
    console.error('Cancel prescription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel prescription',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get available medications
const getAvailableMedications = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;
    
    let query = { isActive: true };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { genericName: { $regex: search, $options: 'i' } },
        { brandName: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      query.category = category;
    }
    
    const medications = await Medication.find(query)
      .select('name genericName brandName category dosageForm strength inventory')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ name: 1 });
    
    const total = await Medication.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        medications,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get available medications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available medications',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  getAllPrescriptions,
  getPrescriptionById,
  createPrescription,
  updatePrescription,
  cancelPrescription,
  getAvailableMedications
};