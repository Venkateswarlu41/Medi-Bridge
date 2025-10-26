const Appointment = require('../models/appointment.model');
const User = require('../models/user.model');
const Department = require('../models/department.model');
const { validationResult } = require('express-validator');

// Get all appointments
const getAllAppointments = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      doctorId, 
      patientId, 
      departmentId,
      date,
      type 
    } = req.query;
    
    const skip = (page - 1) * limit;
    
    // Build query based on user role
    let query = {};
    
    if (req.user.role === 'doctor') {
      query.doctor = req.user._id;
    } else if (req.user.role === 'patient') {
      query.patient = req.user._id;
    }
    
    // Apply filters
    if (status) {
      // Handle multiple status values separated by comma
      if (status.includes(',')) {
        query.status = { $in: status.split(',') };
      } else {
        query.status = status;
      }
    }
    if (doctorId && req.user.role !== 'doctor') query.doctor = doctorId;
    if (patientId && req.user.role !== 'patient') query.patient = patientId;
    if (departmentId) query.department = departmentId;
    if (type) query.type = type;
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.appointmentDate = {
        $gte: startDate,
        $lt: endDate
      };
    }
    
    const appointments = await Appointment.find(query)
      .populate('patient', 'firstName lastName email phone dateOfBirth')
      .populate('doctor', 'firstName lastName specialization')
      .populate('department', 'name code')
      .populate('scheduledBy', 'firstName lastName')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ appointmentDate: 1, appointmentTime: 1 });
    
    const total = await Appointment.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        appointments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get appointment by ID
const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const appointment = await Appointment.findById(id)
      .populate('patient', 'firstName lastName email phone dateOfBirth gender bloodGroup')
      .populate('doctor', 'firstName lastName specialization licenseNumber')
      .populate('department', 'name code location')
      .populate('scheduledBy', 'firstName lastName');
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    // Check access permissions
    if (req.user.role === 'patient' && appointment.patient._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    if (req.user.role === 'doctor' && appointment.doctor._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    res.json({
      success: true,
      data: { appointment }
    });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointment',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Create new appointment
const createAppointment = async (req, res) => {
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
      doctorId,
      departmentId,
      appointmentDate,
      appointmentTime,
      duration = 30,
      type,
      chiefComplaint,
      symptoms,
      notes,
      priority = 'normal'
    } = req.body;
    
    // Convert 12-hour time format to 24-hour format if needed
    const convertTo24Hour = (time12h) => {
      if (time12h.includes('AM') || time12h.includes('PM')) {
        const [time, period] = time12h.split(' ');
        let [hours, minutes] = time.split(':');
        hours = parseInt(hours);
        
        if (period === 'PM' && hours !== 12) {
          hours += 12;
        } else if (period === 'AM' && hours === 12) {
          hours = 0;
        }
        
        return `${String(hours).padStart(2, '0')}:${minutes}`;
      }
      return appointmentTime; // Already in 24-hour format
    };
    
    const convertedTime = convertTo24Hour(appointmentTime);
    
    // Verify doctor exists and is active
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor' || !doctor.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Invalid doctor selected'
      });
    }
    
    // Verify patient exists
    let patient;
    if (req.user.role === 'patient') {
      patient = req.user;
    } else {
      patient = await User.findById(patientId);
      if (!patient || patient.role !== 'patient') {
        return res.status(400).json({
          success: false,
          message: 'Invalid patient selected'
        });
      }
    }
    
    // Check for scheduling conflicts
    const conflictCheck = await Appointment.checkConflicts(
      doctorId,
      appointmentDate,
      convertedTime,
      duration
    );
    
    if (conflictCheck.hasConflict) {
      return res.status(400).json({
        success: false,
        message: 'Doctor is not available at the selected time',
        conflictingAppointment: conflictCheck.conflictingAppointment
      });
    }
    
    // Create appointment
    const appointment = new Appointment({
      patient: patient._id,
      doctor: doctorId,
      department: departmentId,
      appointmentDate,
      appointmentTime: convertedTime, // Use converted 24-hour format
      duration,
      type,
      chiefComplaint,
      symptoms,
      notes,
      priority,
      scheduledBy: req.user._id
    });
    
    await appointment.save();
    
    // Populate the created appointment
    await appointment.populate([
      { path: 'patient', select: 'firstName lastName email phone' },
      { path: 'doctor', select: 'firstName lastName specialization' },
      { path: 'department', select: 'name code' }
    ]);
    
    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: { appointment }
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create appointment',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update appointment
const updateAppointment = async (req, res) => {
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
    
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    // Check permissions
    if (req.user.role === 'patient' && appointment.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    // If rescheduling, check for conflicts
    if (updateData.appointmentDate || updateData.appointmentTime || updateData.duration) {
      const conflictCheck = await Appointment.checkConflicts(
        appointment.doctor,
        updateData.appointmentDate || appointment.appointmentDate,
        updateData.appointmentTime || appointment.appointmentTime,
        updateData.duration || appointment.duration,
        id
      );
      
      if (conflictCheck.hasConflict) {
        return res.status(400).json({
          success: false,
          message: 'Doctor is not available at the selected time',
          conflictingAppointment: conflictCheck.conflictingAppointment
        });
      }
      
      // Track rescheduling
      if (updateData.appointmentDate || updateData.appointmentTime) {
        updateData.rescheduling = {
          originalDate: appointment.appointmentDate,
          originalTime: appointment.appointmentTime,
          rescheduledAt: new Date(),
          rescheduledBy: req.user._id,
          reason: updateData.rescheduleReason || 'Not specified'
        };
      }
    }
    
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      { path: 'patient', select: 'firstName lastName email phone' },
      { path: 'doctor', select: 'firstName lastName specialization' },
      { path: 'department', select: 'name code' }
    ]);
    
    res.json({
      success: true,
      message: 'Appointment updated successfully',
      data: { appointment: updatedAppointment }
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update appointment',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Cancel appointment
const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    // Check permissions
    if (req.user.role === 'patient' && appointment.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    appointment.status = 'cancelled';
    appointment.cancellation = {
      cancelledAt: new Date(),
      cancelledBy: req.user._id,
      reason: reason || 'Not specified'
    };
    
    await appointment.save();
    
    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: { appointment }
    });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel appointment',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update appointment status
const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const appointment = await Appointment.findById(id)
      .populate('patient', 'firstName lastName email phone')
      .populate('doctor', 'firstName lastName specialization');
      
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    // Only doctors and admin can update status
    if (!['admin', 'doctor'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    await appointment.updateStatus(status, req.user._id);
    
    // If appointment is completed, create a medical record
    if (status === 'completed') {
      const MedicalRecord = require('../models/medicalRecord.model');
      
      const medicalRecord = new MedicalRecord({
        patient: appointment.patient._id,
        doctor: appointment.doctor._id,
        appointment: appointment._id,
        department: appointment.department,
        recordType: 'consultation',
        recordDate: new Date(),
        chiefComplaint: appointment.chiefComplaint,
        notes: appointment.notes || 'No additional notes',
        status: 'completed',  // Changed from 'active' to 'completed' to match the enum
        createdBy: req.user._id  // This was missing!
      });
      
      await medicalRecord.save();
    }
    
    res.json({
      success: true,
      message: 'Appointment status updated successfully',
      data: { appointment }
    });
  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update appointment status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get doctor's availability
const getDoctorAvailability = async (req, res) => {
  try {
    const { doctorId, date } = req.query;
    
    if (!doctorId || !date) {
      return res.status(400).json({
        success: false,
        message: 'Doctor ID and date are required'
      });
    }
    
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);
    
    const appointments = await Appointment.find({
      doctor: doctorId,
      appointmentDate: {
        $gte: startDate,
        $lt: endDate
      },
      status: { $in: ['scheduled', 'confirmed', 'in-progress'] }
    }).select('appointmentTime duration');
    
    // Generate available time slots (9 AM to 5 PM, 30-minute slots)
    const availableSlots = [];
    const startHour = 9;
    const endHour = 17;
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeSlot = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        
        // Check if this slot conflicts with existing appointments
        const hasConflict = appointments.some(apt => {
          const aptStart = apt.appointmentTime;
          const [aptHour, aptMinute] = aptStart.split(':').map(Number);
          const aptDuration = apt.duration || 30; // Default 30 minutes
          const aptEndMinute = aptMinute + aptDuration;
          const aptEndHour = aptHour + Math.floor(aptEndMinute / 60);
          const aptEndMin = aptEndMinute % 60;
          
          const slotStart = hour * 60 + minute;
          const slotEnd = slotStart + 30;
          const aptStartMin = aptHour * 60 + aptMinute;
          const aptEndTotalMin = aptEndHour * 60 + aptEndMin;
          
          return (slotStart < aptEndTotalMin) && (slotEnd > aptStartMin);
        });
        
        if (!hasConflict) {
          // Convert to 12-hour format for frontend
          const period = hour >= 12 ? 'PM' : 'AM';
          const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
          const time12Hour = `${displayHour}:${String(minute).padStart(2, '0')} ${period}`;
          
          availableSlots.push({
            time: time12Hour,
            value: timeSlot, // Keep 24-hour format for backend processing
            available: true
          });
        }
      }
    }
    
    res.json({
      success: true,
      data: {
        date,
        doctorId,
        availableSlots,
        bookedSlots: appointments.map(apt => ({
          time: apt.appointmentTime,
          duration: apt.duration
        }))
      }
    });
  } catch (error) {
    console.error('Get doctor availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctor availability',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Download appointment medical record as PDF
const downloadAppointmentRecord = async (req, res) => {
  try {
    const { id } = req.params;
    
    const appointment = await Appointment.findById(id)
      .populate('patient', 'firstName lastName email phone dateOfBirth gender bloodGroup address')
      .populate('doctor', 'firstName lastName specialization licenseNumber')
      .populate('department', 'name code location')
      .populate('scheduledBy', 'firstName lastName');
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    // Check access permissions
    if (req.user.role === 'patient' && appointment.patient._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    if (req.user.role === 'doctor' && appointment.doctor._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get related medical record if appointment is completed
    let medicalRecord = null;
    if (appointment.status === 'completed') {
      const MedicalRecord = require('../models/medicalRecord.model');
      medicalRecord = await MedicalRecord.findOne({ appointment: appointment._id })
        .populate('doctor', 'firstName lastName specialization')
        .populate('patient', 'firstName lastName dateOfBirth gender');
    }
    
    // Generate PDF content
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument();
    
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="medical-record-${appointment._id}.pdf"`);
    
    // Pipe the PDF to the response
    doc.pipe(res);
    
    // Add content to PDF
    doc.fontSize(20).text('Medical Record', 50, 50);
    doc.fontSize(12);
    
    // Patient Information
    doc.text('PATIENT INFORMATION', 50, 100);
    doc.text(`Name: ${appointment.patient.firstName} ${appointment.patient.lastName}`, 50, 120);
    doc.text(`Date of Birth: ${appointment.patient.dateOfBirth ? new Date(appointment.patient.dateOfBirth).toLocaleDateString() : 'N/A'}`, 50, 140);
    doc.text(`Gender: ${appointment.patient.gender || 'N/A'}`, 50, 160);
    doc.text(`Blood Group: ${appointment.patient.bloodGroup || 'N/A'}`, 50, 180);
    doc.text(`Phone: ${appointment.patient.phone || 'N/A'}`, 50, 200);
    doc.text(`Email: ${appointment.patient.email || 'N/A'}`, 50, 220);
    
    // Appointment Information
    doc.text('APPOINTMENT INFORMATION', 50, 260);
    doc.text(`Appointment ID: ${appointment._id}`, 50, 280);
    doc.text(`Date: ${new Date(appointment.appointmentDate).toLocaleDateString()}`, 50, 300);
    doc.text(`Time: ${appointment.appointmentTime}`, 50, 320);
    doc.text(`Type: ${appointment.type}`, 50, 340);
    doc.text(`Status: ${appointment.status}`, 50, 360);
    doc.text(`Duration: ${appointment.duration} minutes`, 50, 380);
    
    // Doctor Information
    doc.text('DOCTOR INFORMATION', 50, 420);
    doc.text(`Doctor: Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`, 50, 440);
    doc.text(`Specialization: ${appointment.doctor.specialization || 'N/A'}`, 50, 460);
    doc.text(`Department: ${appointment.department.name}`, 50, 480);
    
    // Chief Complaint
    if (appointment.chiefComplaint) {
      doc.text('CHIEF COMPLAINT', 50, 520);
      doc.text(appointment.chiefComplaint, 50, 540, { width: 500 });
    }
    
    // Medical Record Details (if appointment is completed)
    if (medicalRecord) {
      let yPosition = 600;
      
      doc.text('MEDICAL RECORD DETAILS', 50, yPosition);
      yPosition += 20;
      
      if (medicalRecord.diagnosis && medicalRecord.diagnosis.length > 0) {
        doc.text('Diagnosis:', 50, yPosition);
        yPosition += 20;
        medicalRecord.diagnosis.forEach((diag, index) => {
          doc.text(`${index + 1}. ${diag.description}`, 70, yPosition);
          yPosition += 15;
        });
        yPosition += 10;
      }
      
      if (medicalRecord.prescriptions && medicalRecord.prescriptions.length > 0) {
        doc.text('Prescriptions:', 50, yPosition);
        yPosition += 20;
        medicalRecord.prescriptions.forEach((med, index) => {
          doc.text(`${index + 1}. ${med.medication} - ${med.dosage} (${med.frequency})`, 70, yPosition);
          if (med.instructions) {
            yPosition += 15;
            doc.text(`   Instructions: ${med.instructions}`, 70, yPosition);
          }
          yPosition += 15;
        });
        yPosition += 10;
      }
      
      if (medicalRecord.labTests && medicalRecord.labTests.length > 0) {
        doc.text('Lab Tests:', 50, yPosition);
        yPosition += 20;
        medicalRecord.labTests.forEach((test, index) => {
          doc.text(`${index + 1}. ${test.testName} - ${test.result} (${test.status})`, 70, yPosition);
          yPosition += 15;
        });
        yPosition += 10;
      }
      
      if (medicalRecord.notes) {
        doc.text('Additional Notes:', 50, yPosition);
        yPosition += 20;
        doc.text(medicalRecord.notes, 50, yPosition, { width: 500 });
      }
    }
    
    // Footer
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 50, doc.page.height - 50);
    
    // Finalize the PDF
    doc.end();
    
  } catch (error) {
    console.error('Download appointment record error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download appointment record',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get dashboard statistics for patient
const getPatientDashboardStats = async (req, res) => {
  try {
    const patientId = req.user._id;
    
    // Get upcoming appointments count
    const upcomingAppointments = await Appointment.countDocuments({
      patient: patientId,
      status: { $in: ['scheduled', 'confirmed'] }
    });
    
    // Get total appointments count
    const totalAppointments = await Appointment.countDocuments({
      patient: patientId
    });
    
    // Get completed appointments count
    const completedAppointments = await Appointment.countDocuments({
      patient: patientId,
      status: 'completed'
    });
    
    // Get medical records count
    const MedicalRecord = require('../models/medicalRecord.model');
    const totalMedicalRecords = await MedicalRecord.countDocuments({
      patient: patientId
    });
    
    // Get lab tests count (if lab test model exists)
    let pendingLabResults = 0;
    let totalLabTests = 0;
    try {
      const LabTest = require('../models/labTest.model');
      pendingLabResults = await LabTest.countDocuments({
        patient: patientId,
        status: 'completed',
        patientViewed: { $ne: true }
      });
      totalLabTests = await LabTest.countDocuments({
        patient: patientId
      });
    } catch (error) {
      console.log('Lab test model not found, skipping lab test stats');
    }
    
    const stats = {
      upcomingAppointments,
      totalAppointments,
      completedAppointments,
      totalMedicalRecords,
      pendingLabResults,
      totalLabTests
    };
    
    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Get patient dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  updateAppointmentStatus,
  getDoctorAvailability,
  downloadAppointmentRecord,
  getPatientDashboardStats
};