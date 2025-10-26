const MedicalRecord = require('../models/medicalRecord.model');
const User = require('../models/user.model');
const { validationResult } = require('express-validator');

// Get all medical records
const getAllMedicalRecords = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      patientId, 
      doctorId, 
      recordType, 
      status,
      dateFrom,
      dateTo 
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
    if (patientId && req.user.role !== 'patient') query.patient = patientId;
    if (doctorId && req.user.role !== 'doctor') query.doctor = doctorId;
    if (recordType) query.recordType = recordType;
    if (status) query.status = status;
    
    if (dateFrom || dateTo) {
      query.recordDate = {};
      if (dateFrom) query.recordDate.$gte = new Date(dateFrom);
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setDate(endDate.getDate() + 1);
        query.recordDate.$lt = endDate;
      }
    }
    
    const records = await MedicalRecord.find(query)
      .populate('patient', 'firstName lastName email phone dateOfBirth')
      .populate('doctor', 'firstName lastName specialization')
      .populate('department', 'name code')
      .populate('appointment', 'appointmentDate appointmentTime type')
      .populate('createdBy', 'firstName lastName')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ recordDate: -1 });
    
    const total = await MedicalRecord.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        records,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get medical records error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch medical records',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get medical record by ID
const getMedicalRecordById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const record = await MedicalRecord.findById(id)
      .populate('patient', 'firstName lastName email phone dateOfBirth gender bloodGroup')
      .populate('doctor', 'firstName lastName specialization licenseNumber')
      .populate('department', 'name code location')
      .populate('appointment', 'appointmentDate appointmentTime type chiefComplaint')
      .populate('createdBy', 'firstName lastName')
      .populate('reviewedBy', 'firstName lastName')
      .populate('lastModifiedBy', 'firstName lastName')
      .populate('labResults.technician', 'firstName lastName')
      .populate('imagingResults.radiologist', 'firstName lastName');
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found'
      });
    }
    
    // Check access permissions
    if (req.user.role === 'patient' && record.patient._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    if (req.user.role === 'doctor' && record.doctor._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    res.json({
      success: true,
      data: { record }
    });
  } catch (error) {
    console.error('Get medical record error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch medical record',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Create new medical record
const createMedicalRecord = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const recordData = {
      ...req.body,
      createdBy: req.user._id
    };
    
    // If doctor is creating, set doctor field
    if (req.user.role === 'doctor') {
      recordData.doctor = req.user._id;
    }
    
    const record = new MedicalRecord(recordData);
    await record.save();
    
    // Populate the created record
    await record.populate([
      { path: 'patient', select: 'firstName lastName email phone' },
      { path: 'doctor', select: 'firstName lastName specialization' },
      { path: 'department', select: 'name code' },
      { path: 'createdBy', select: 'firstName lastName' }
    ]);
    
    res.status(201).json({
      success: true,
      message: 'Medical record created successfully',
      data: { record }
    });
  } catch (error) {
    console.error('Create medical record error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create medical record',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update medical record
const updateMedicalRecord = async (req, res) => {
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
    
    const record = await MedicalRecord.findById(id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found'
      });
    }
    
    // Check permissions - only the creating doctor or admin can update
    if (req.user.role === 'doctor' && record.doctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    const updatedRecord = await MedicalRecord.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      { path: 'patient', select: 'firstName lastName email phone' },
      { path: 'doctor', select: 'firstName lastName specialization' },
      { path: 'department', select: 'name code' },
      { path: 'lastModifiedBy', select: 'firstName lastName' }
    ]);
    
    res.json({
      success: true,
      message: 'Medical record updated successfully',
      data: { record: updatedRecord }
    });
  } catch (error) {
    console.error('Update medical record error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update medical record',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Add amendment to medical record
const addAmendment = async (req, res) => {
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
    const { reason, changes } = req.body;
    
    const record = await MedicalRecord.findById(id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found'
      });
    }
    
    // Check permissions
    if (req.user.role === 'doctor' && record.doctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    await record.addAmendment(req.user._id, reason, changes);
    
    res.json({
      success: true,
      message: 'Amendment added successfully',
      data: {
        amendment: record.amendments[record.amendments.length - 1]
      }
    });
  } catch (error) {
    console.error('Add amendment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add amendment',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Add lab result
const addLabResult = async (req, res) => {
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
    const labResultData = {
      ...req.body,
      technician: req.user._id,
      reportedDate: new Date()
    };
    
    const record = await MedicalRecord.findById(id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found'
      });
    }
    
    record.labResults.push(labResultData);
    await record.save();
    
    res.json({
      success: true,
      message: 'Lab result added successfully',
      data: {
        labResult: record.labResults[record.labResults.length - 1]
      }
    });
  } catch (error) {
    console.error('Add lab result error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add lab result',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get patient medical history
const getPatientMedicalHistory = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    // Check permissions
    if (req.user.role === 'patient' && patientId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    const records = await MedicalRecord.find({ patient: patientId })
      .populate('doctor', 'firstName lastName specialization')
      .populate('department', 'name code')
      .populate('appointment', 'appointmentDate appointmentTime type')
      .sort({ recordDate: -1 });
    
    // Group records by type
    const groupedRecords = records.reduce((acc, record) => {
      if (!acc[record.recordType]) {
        acc[record.recordType] = [];
      }
      acc[record.recordType].push(record);
      return acc;
    }, {});
    
    // Get summary statistics
    const summary = {
      totalRecords: records.length,
      recordTypes: Object.keys(groupedRecords).map(type => ({
        type,
        count: groupedRecords[type].length
      })),
      latestRecord: records[0] || null,
      dateRange: {
        earliest: records.length > 0 ? records[records.length - 1].recordDate : null,
        latest: records.length > 0 ? records[0].recordDate : null
      }
    };
    
    res.json({
      success: true,
      data: {
        summary,
        records: groupedRecords,
        chronologicalRecords: records
      }
    });
  } catch (error) {
    console.error('Get patient medical history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patient medical history',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Review medical record
const reviewMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;
    
    const record = await MedicalRecord.findById(id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found'
      });
    }
    
    record.status = 'reviewed';
    record.reviewedBy = req.user._id;
    record.reviewedAt = new Date();
    
    await record.save();
    
    res.json({
      success: true,
      message: 'Medical record reviewed successfully',
      data: { record }
    });
  } catch (error) {
    console.error('Review medical record error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to review medical record',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Download medical record as PDF
const downloadMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;
    
    const record = await MedicalRecord.findById(id)
      .populate('patient', 'firstName lastName email phone dateOfBirth gender bloodGroup address')
      .populate('doctor', 'firstName lastName specialization licenseNumber')
      .populate('department', 'name code location')
      .populate('appointment', 'appointmentDate appointmentTime type chiefComplaint')
      .populate('createdBy', 'firstName lastName')
      .populate('reviewedBy', 'firstName lastName')
      .populate('labResults.technician', 'firstName lastName')
      .populate('imagingResults.radiologist', 'firstName lastName');
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found'
      });
    }
    
    // Check access permissions
    if (req.user.role === 'patient' && record.patient._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    if (req.user.role === 'doctor' && record.doctor._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    // Generate PDF content
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument();
    
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="medical-record-${record._id}.pdf"`);
    
    // Pipe the PDF to the response
    doc.pipe(res);
    
    // Add content to PDF
    doc.fontSize(20).text('Medical Record', 50, 50);
    doc.fontSize(12);
    
    // Patient Information
    doc.text('PATIENT INFORMATION', 50, 100);
    doc.text(`Name: ${record.patient.firstName} ${record.patient.lastName}`, 50, 120);
    doc.text(`Date of Birth: ${record.patient.dateOfBirth ? new Date(record.patient.dateOfBirth).toLocaleDateString() : 'N/A'}`, 50, 140);
    doc.text(`Gender: ${record.patient.gender || 'N/A'}`, 50, 160);
    doc.text(`Blood Group: ${record.patient.bloodGroup || 'N/A'}`, 50, 180);
    doc.text(`Phone: ${record.patient.phone || 'N/A'}`, 50, 200);
    doc.text(`Email: ${record.patient.email || 'N/A'}`, 50, 220);
    
    // Medical Record Information
    doc.text('MEDICAL RECORD INFORMATION', 50, 260);
    doc.text(`Record ID: ${record._id}`, 50, 280);
    doc.text(`Record Type: ${record.recordType}`, 50, 300);
    doc.text(`Record Date: ${new Date(record.recordDate).toLocaleDateString()}`, 50, 320);
    doc.text(`Status: ${record.status}`, 50, 340);
    
    // Doctor Information
    doc.text('DOCTOR INFORMATION', 50, 380);
    doc.text(`Doctor: Dr. ${record.doctor.firstName} ${record.doctor.lastName}`, 50, 400);
    doc.text(`Specialization: ${record.doctor.specialization || 'N/A'}`, 50, 420);
    doc.text(`Department: ${record.department.name}`, 50, 440);
    
    let yPosition = 480;
    
    // Appointment Information (if linked to appointment)
    if (record.appointment) {
      doc.text('APPOINTMENT INFORMATION', 50, yPosition);
      yPosition += 20;
      doc.text(`Date: ${new Date(record.appointment.appointmentDate).toLocaleDateString()}`, 50, yPosition);
      yPosition += 20;
      doc.text(`Time: ${record.appointment.appointmentTime}`, 50, yPosition);
      yPosition += 20;
      doc.text(`Type: ${record.appointment.type}`, 50, yPosition);
      yPosition += 20;
      if (record.appointment.chiefComplaint) {
        doc.text(`Chief Complaint: ${record.appointment.chiefComplaint}`, 50, yPosition, { width: 500 });
        yPosition += 40;
      }
    }
    
    // Chief Complaint (from record)
    if (record.chiefComplaint) {
      doc.text('CHIEF COMPLAINT', 50, yPosition);
      yPosition += 20;
      doc.text(record.chiefComplaint, 50, yPosition, { width: 500 });
      yPosition += 40;
    }
    
    // Diagnosis
    if (record.diagnosis && record.diagnosis.length > 0) {
      doc.text('DIAGNOSIS', 50, yPosition);
      yPosition += 20;
      record.diagnosis.forEach((diag, index) => {
        doc.text(`${index + 1}. ${diag.description}`, 70, yPosition);
        yPosition += 15;
        if (diag.icdCode) {
          doc.text(`   ICD Code: ${diag.icdCode}`, 70, yPosition);
          yPosition += 15;
        }
      });
      yPosition += 10;
    }
    
    // Treatment Plan
    if (record.treatmentPlan) {
      doc.text('TREATMENT PLAN', 50, yPosition);
      yPosition += 20;
      doc.text(record.treatmentPlan, 50, yPosition, { width: 500 });
      yPosition += 40;
    }
    
    // Prescriptions
    if (record.prescriptions && record.prescriptions.length > 0) {
      doc.text('PRESCRIPTIONS', 50, yPosition);
      yPosition += 20;
      record.prescriptions.forEach((med, index) => {
        doc.text(`${index + 1}. ${med.medication}`, 70, yPosition);
        yPosition += 15;
        doc.text(`   Dosage: ${med.dosage}`, 70, yPosition);
        yPosition += 15;
        doc.text(`   Frequency: ${med.frequency}`, 70, yPosition);
        yPosition += 15;
        if (med.duration) {
          doc.text(`   Duration: ${med.duration}`, 70, yPosition);
          yPosition += 15;
        }
        if (med.instructions) {
          doc.text(`   Instructions: ${med.instructions}`, 70, yPosition);
          yPosition += 15;
        }
        yPosition += 5;
      });
      yPosition += 10;
    }
    
    // Lab Tests
    if (record.labTests && record.labTests.length > 0) {
      doc.text('LAB TESTS', 50, yPosition);
      yPosition += 20;
      record.labTests.forEach((test, index) => {
        doc.text(`${index + 1}. ${test.testName}`, 70, yPosition);
        yPosition += 15;
        doc.text(`   Result: ${test.result}`, 70, yPosition);
        yPosition += 15;
        doc.text(`   Status: ${test.status}`, 70, yPosition);
        yPosition += 15;
        if (test.normalRange) {
          doc.text(`   Normal Range: ${test.normalRange}`, 70, yPosition);
          yPosition += 15;
        }
        yPosition += 5;
      });
      yPosition += 10;
    }
    
    // Lab Results
    if (record.labResults && record.labResults.length > 0) {
      doc.text('LAB RESULTS', 50, yPosition);
      yPosition += 20;
      record.labResults.forEach((result, index) => {
        doc.text(`${index + 1}. ${result.testName}`, 70, yPosition);
        yPosition += 15;
        doc.text(`   Result: ${result.result}`, 70, yPosition);
        yPosition += 15;
        doc.text(`   Status: ${result.status}`, 70, yPosition);
        yPosition += 15;
        if (result.reportedDate) {
          doc.text(`   Reported: ${new Date(result.reportedDate).toLocaleDateString()}`, 70, yPosition);
          yPosition += 15;
        }
        yPosition += 5;
      });
      yPosition += 10;
    }
    
    // Additional Notes
    if (record.notes) {
      doc.text('ADDITIONAL NOTES', 50, yPosition);
      yPosition += 20;
      doc.text(record.notes, 50, yPosition, { width: 500 });
      yPosition += 40;
    }
    
    // Follow-up Instructions
    if (record.followUpInstructions) {
      doc.text('FOLLOW-UP INSTRUCTIONS', 50, yPosition);
      yPosition += 20;
      doc.text(record.followUpInstructions, 50, yPosition, { width: 500 });
      yPosition += 40;
    }
    
    // Footer
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 50, doc.page.height - 50);
    doc.text(`Generated by: ${req.user.firstName} ${req.user.lastName}`, 50, doc.page.height - 30);
    
    // Finalize the PDF
    doc.end();
    
  } catch (error) {
    console.error('Download medical record error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download medical record',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  getAllMedicalRecords,
  getMedicalRecordById,
  createMedicalRecord,
  updateMedicalRecord,
  addAmendment,
  addLabResult,
  getPatientMedicalHistory,
  reviewMedicalRecord,
  downloadMedicalRecord
};