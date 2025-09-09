const User = require('../models/user.model');
const Patient = require('../models/patient.model');
const { validationResult } = require('express-validator');

// Get all patients (Admin and Doctor access)
const getAllPatients = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    let query = { role: 'patient' };
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      query.isActive = status === 'active';
    }

    const patients = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    // Get patient details for each user
    const patientsWithDetails = await Promise.all(
      patients.map(async (patient) => {
        const patientDetails = await Patient.findOne({ user: patient._id });
        return {
          ...patient.toObject(),
          patientDetails
        };
      })
    );

    res.json({
      success: true,
      data: {
        patients: patientsWithDetails,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all patients error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patients',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get patient by ID
const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await User.findById(id).select('-password');
    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    const patientDetails = await Patient.findOne({ user: id });

    res.json({
      success: true,
      data: {
        patient: {
          ...patient.toObject(),
          patientDetails
        }
      }
    });
  } catch (error) {
    console.error('Get patient by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patient',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update patient
const updatePatient = async (req, res) => {
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
    const updateData = { ...req.body };

    // Remove sensitive fields
    delete updateData.password;
    delete updateData.role;
    delete updateData.email;

    const patient = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Update patient details if provided
    if (req.body.patientDetails) {
      await Patient.findOneAndUpdate(
        { user: id },
        req.body.patientDetails,
        { new: true, runValidators: true }
      );
    }

    const patientDetails = await Patient.findOne({ user: id });

    res.json({
      success: true,
      message: 'Patient updated successfully',
      data: {
        patient: {
          ...patient.toObject(),
          patientDetails
        }
      }
    });
  } catch (error) {
    console.error('Update patient error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update patient',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Add vital signs to patient
const addVitalSigns = async (req, res) => {
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
    const vitalData = req.body;

    const patient = await Patient.findOne({ user: id });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    await patient.addVitalSigns(vitalData, req.user._id);

    res.json({
      success: true,
      message: 'Vital signs added successfully',
      data: {
        vitalSigns: patient.vitalSigns[patient.vitalSigns.length - 1]
      }
    });
  } catch (error) {
    console.error('Add vital signs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add vital signs',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get patient medical history
const getPatientHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findOne({ user: id })
      .populate('vitalSigns.recordedBy', 'firstName lastName')
      .populate('notes.createdBy', 'firstName lastName');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Get medical records
    const MedicalRecord = require('../models/medicalRecord.model');
    const medicalRecords = await MedicalRecord.find({ patient: id })
      .populate('doctor', 'firstName lastName specialization')
      .populate('department', 'name')
      .sort({ recordDate: -1 })
      .limit(10);

    // Get appointments
    const Appointment = require('../models/appointment.model');
    const appointments = await Appointment.find({ patient: id })
      .populate('doctor', 'firstName lastName specialization')
      .populate('department', 'name')
      .sort({ appointmentDate: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        medicalHistory: patient.medicalHistory,
        vitalSigns: patient.vitalSigns.slice(-10), // Last 10 vital signs
        notes: patient.notes.slice(-10), // Last 10 notes
        recentMedicalRecords: medicalRecords,
        recentAppointments: appointments
      }
    });
  } catch (error) {
    console.error('Get patient history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patient history',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Add note to patient
const addPatientNote = async (req, res) => {
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
    const { content, type = 'general' } = req.body;

    const patient = await Patient.findOne({ user: id });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    await patient.addNote(content, req.user._id, type);

    res.json({
      success: true,
      message: 'Note added successfully',
      data: {
        note: patient.notes[patient.notes.length - 1]
      }
    });
  } catch (error) {
    console.error('Add patient note error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add note',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  getAllPatients,
  getPatientById,
  updatePatient,
  addVitalSigns,
  getPatientHistory,
  addPatientNote
};