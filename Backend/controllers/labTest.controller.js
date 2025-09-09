const LabTest = require('../models/labTest.model');
const User = require('../models/user.model');
const Appointment = require('../models/appointment.model');
const { validationResult } = require('express-validator');

// Get all lab tests
const getAllLabTests = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      testType, 
      priority,
      patientId,
      assignedTechnician 
    } = req.query;
    
    const skip = (page - 1) * limit;
    
    // Build query based on user role
    let query = {};
    
    if (req.user.role === 'lab_technician') {
      query.assignedTechnician = req.user._id;
    } else if (req.user.role === 'doctor') {
      query.doctor = req.user._id;
    } else if (req.user.role === 'patient') {
      query.patient = req.user._id;
    }
    
    // Apply filters
    if (status) {
      // Handle comma-separated status values
      const statusArray = status.split(',').map(s => s.trim());
      query.status = statusArray.length > 1 ? { $in: statusArray } : status;
    }
    if (testType) query.testType = testType;
    if (priority) query.priority = priority;
    if (patientId && req.user.role !== 'patient') query.patient = patientId;
    if (assignedTechnician && req.user.role !== 'lab_technician') query.assignedTechnician = assignedTechnician;
    
    const labTests = await LabTest.find(query)
      .populate('patient', 'firstName lastName email phone')
      .populate('doctor', 'firstName lastName specialization')
      .populate('assignedTechnician', 'firstName lastName')
      .populate('appointment', 'appointmentId appointmentDate appointmentTime')
      .populate('department', 'name code')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ requestDate: -1 });
    
    const total = await LabTest.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        labTests,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get lab tests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lab tests',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get lab test by ID
const getLabTestById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const labTest = await LabTest.findById(id)
      .populate('patient', 'firstName lastName email phone dateOfBirth gender')
      .populate('doctor', 'firstName lastName specialization')
      .populate('assignedTechnician', 'firstName lastName')
      .populate('appointment', 'appointmentId appointmentDate appointmentTime chiefComplaint')
      .populate('department', 'name code location')
      .populate('requestedBy', 'firstName lastName')
      .populate('doctorReview.reviewedBy', 'firstName lastName')
      .populate('qualityControl.verifiedBy', 'firstName lastName');
    
    if (!labTest) {
      return res.status(404).json({
        success: false,
        message: 'Lab test not found'
      });
    }
    
    // Check access permissions
    if (req.user.role === 'patient' && labTest.patient._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    if (req.user.role === 'doctor' && labTest.doctor._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    if (req.user.role === 'lab_technician' && 
        (!labTest.assignedTechnician || labTest.assignedTechnician._id.toString() !== req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    res.json({
      success: true,
      data: { labTest }
    });
  } catch (error) {
    console.error('Get lab test error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lab test',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Create lab test request
const createLabTest = async (req, res) => {
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
      appointmentId,
      testName,
      testType,
      priority = 'routine',
      assignedTechnician,
      clinicalIndication,
      specialInstructions
    } = req.body;
    
    console.log('Creating lab test with data:', {
      appointmentId,
      testName,
      testType,
      priority,
      assignedTechnician,
      clinicalIndication,
      specialInstructions
    });
    
    // Verify appointment exists and user has access
    const appointment = await Appointment.findById(appointmentId)
      .populate('patient')
      .populate('department');
    
    if (!appointment) {
      console.error('Appointment not found:', appointmentId);
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    console.log('Found appointment:', {
      id: appointment._id,
      doctor: appointment.doctor,
      patient: appointment.patient?._id,
      department: appointment.department?._id
    });
    
    // Only doctors can create lab test requests
    if (req.user.role !== 'doctor' || appointment.doctor.toString() !== req.user._id.toString()) {
      console.error('Access denied:', {
        userRole: req.user.role,
        userId: req.user._id,
        appointmentDoctor: appointment.doctor
      });
      return res.status(403).json({
        success: false,
        message: 'Only the assigned doctor can request lab tests'
      });
    }
    
    // Verify assigned technician exists if provided
    if (assignedTechnician) {
      const technician = await User.findById(assignedTechnician);
      if (!technician || technician.role !== 'lab_technician' || !technician.isActive) {
        console.error('Invalid technician:', assignedTechnician);
        return res.status(400).json({
          success: false,
          message: 'Invalid or inactive lab technician selected'
        });
      }
    }
    
    // Handle missing department - use default or find one
    let departmentId = appointment.department?._id;
    if (!departmentId) {
      console.warn('No department found for appointment, using default');
      // Find a default department or create a fallback
      const Department = require('../models/department.model');
      let defaultDept = await Department.findOne({ code: 'LAB' });
      if (!defaultDept) {
        // Create a default lab department if it doesn't exist
        defaultDept = new Department({
          name: 'Laboratory',
          code: 'LAB',
          description: 'Default Laboratory Department',
          head: req.user._id,
          location: { building: 'Main', floor: 1 }
        });
        await defaultDept.save();
      }
      departmentId = defaultDept._id;
    }
    
    const labTestData = {
      appointment: appointmentId,
      patient: appointment.patient._id,
      doctor: req.user._id,
      department: departmentId,
      testName,
      testType,
      priority,
      clinicalIndication,
      specialInstructions,
      requestedBy: req.user._id
    };
    
    if (assignedTechnician) {
      labTestData.assignedTechnician = assignedTechnician;
    }
    
    console.log('Creating lab test with final data:', labTestData);
    
    const labTest = new LabTest(labTestData);
    
    await labTest.save();
    
    // If technician is manually assigned, set status to assigned
    if (assignedTechnician) {
      await labTest.assignTechnician(assignedTechnician);
    } else {
      // Auto-assign to available lab technician
      await autoAssignTechnician(labTest);
    }
    
    // Populate the created lab test
    await labTest.populate([
      { path: 'patient', select: 'firstName lastName email phone' },
      { path: 'doctor', select: 'firstName lastName specialization' },
      { path: 'assignedTechnician', select: 'firstName lastName' },
      { path: 'appointment', select: 'appointmentId appointmentDate appointmentTime' },
      { path: 'department', select: 'name code' }
    ]);
    
    res.status(201).json({
      success: true,
      message: 'Lab test request created successfully',
      data: { labTest }
    });
  } catch (error) {
    console.error('Create lab test error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to create lab test request',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Auto-assign technician to lab test
const autoAssignTechnician = async (labTest) => {
  try {
    // Find available lab technicians in the same department
    const availableTechnicians = await User.find({
      role: 'lab_technician',
      isActive: true,
      department: labTest.department
    });
    
    if (availableTechnicians.length === 0) {
      // If no technicians in same department, find any available technician
      const anyTechnicians = await User.find({
        role: 'lab_technician',
        isActive: true
      });
      
      if (anyTechnicians.length > 0) {
        // Assign to technician with least current workload
        const workloads = await Promise.all(
          anyTechnicians.map(async (tech) => {
            const activeTests = await LabTest.countDocuments({
              assignedTechnician: tech._id,
              status: { $in: ['assigned', 'in-progress'] }
            });
            return { technician: tech, workload: activeTests };
          })
        );
        
        workloads.sort((a, b) => a.workload - b.workload);
        await labTest.assignTechnician(workloads[0].technician._id);
      }
    } else {
      // Assign to technician with least workload in the department
      const workloads = await Promise.all(
        availableTechnicians.map(async (tech) => {
          const activeTests = await LabTest.countDocuments({
            assignedTechnician: tech._id,
            status: { $in: ['assigned', 'in-progress'] }
          });
          return { technician: tech, workload: activeTests };
        })
      );
      
      workloads.sort((a, b) => a.workload - b.workload);
      await labTest.assignTechnician(workloads[0].technician._id);
    }
  } catch (error) {
    console.error('Auto-assign technician error:', error);
  }
};

// Update lab test status
const updateLabTestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const labTest = await LabTest.findById(id);
    
    if (!labTest) {
      return res.status(404).json({
        success: false,
        message: 'Lab test not found'
      });
    }
    
    // Check permissions
    if (req.user.role === 'lab_technician' && 
        (!labTest.assignedTechnician || labTest.assignedTechnician.toString() !== req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    if (status === 'in-progress') {
      await labTest.startTest();
    } else {
      labTest.status = status;
      await labTest.save();
    }
    
    res.json({
      success: true,
      message: 'Lab test status updated successfully',
      data: { labTest }
    });
  } catch (error) {
    console.error('Update lab test status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update lab test status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Upload lab test results
const uploadLabResults = async (req, res) => {
  try {
    const { id } = req.params;
    const { results, interpretation, conclusion, recommendations } = req.body;
    
    const labTest = await LabTest.findById(id);
    
    if (!labTest) {
      return res.status(404).json({
        success: false,
        message: 'Lab test not found'
      });
    }
    
    // Only assigned technician can upload results
    if (req.user.role !== 'lab_technician' || 
        (!labTest.assignedTechnician || labTest.assignedTechnician.toString() !== req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Only the assigned technician can upload results'
      });
    }
    
    const resultData = {
      values: results || [],
      interpretation,
      conclusion,
      recommendations
    };
    
    await labTest.completeTest(resultData);
    
    res.json({
      success: true,
      message: 'Lab results uploaded successfully',
      data: { labTest }
    });
  } catch (error) {
    console.error('Upload lab results error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload lab results',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Review lab test (for doctors)
const reviewLabTest = async (req, res) => {
  try {
    const { id } = req.params;
    const { comments, actionTaken } = req.body;
    
    const labTest = await LabTest.findById(id);
    
    if (!labTest) {
      return res.status(404).json({
        success: false,
        message: 'Lab test not found'
      });
    }
    
    // Only the requesting doctor can review
    if (req.user.role !== 'doctor' || labTest.doctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the requesting doctor can review this test'
      });
    }
    
    await labTest.reviewTest(req.user._id, comments, actionTaken);
    
    res.json({
      success: true,
      message: 'Lab test reviewed successfully',
      data: { labTest }
    });
  } catch (error) {
    console.error('Review lab test error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to review lab test',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get lab tests for appointment
const getLabTestsForAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    
    const labTests = await LabTest.find({ appointment: appointmentId })
      .populate('assignedTechnician', 'firstName lastName')
      .populate('department', 'name code')
      .sort({ requestDate: -1 });
    
    res.json({
      success: true,
      data: { labTests }
    });
  } catch (error) {
    console.error('Get lab tests for appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lab tests for appointment',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get all lab technicians (for admin)
const getAllLabTechnicians = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      search,
      department,
      status 
    } = req.query;
    
    const skip = (page - 1) * limit;
    
    // Build query
    let query = {
      role: 'lab_technician'
    };
    
    // Apply filters
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (department) {
      query.department = department;
    }
    
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }
    
    const technicians = await User.find(query)
      .populate('department', 'name code location')
      .select('firstName lastName email phone department isActive createdAt')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ firstName: 1, lastName: 1 });
    
    // Get workload for each technician
    const techniciansWithWorkload = await Promise.all(
      technicians.map(async (tech) => {
        const activeTests = await LabTest.countDocuments({
          assignedTechnician: tech._id,
          status: { $in: ['assigned', 'in-progress'] }
        });
        
        const totalTests = await LabTest.countDocuments({
          assignedTechnician: tech._id
        });
        
        const completedToday = await LabTest.countDocuments({
          assignedTechnician: tech._id,
          status: 'completed',
          completedDate: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)),
            $lt: new Date(new Date().setHours(23, 59, 59, 999))
          }
        });
        
        return {
          ...tech.toObject(),
          currentWorkload: activeTests,
          totalTests,
          completedToday
        };
      })
    );
    
    const total = await User.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        technicians: techniciansWithWorkload,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all lab technicians error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lab technicians',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get available lab technicians
const getAvailableLabTechnicians = async (req, res) => {
  try {
    const { departmentId } = req.query;
    
    let query = {
      role: 'lab_technician',
      isActive: true
    };
    
    if (departmentId) {
      query.department = departmentId;
    }
    
    const technicians = await User.find(query)
      .select('firstName lastName email department')
      .populate('department', 'name code')
      .sort({ firstName: 1, lastName: 1 });
    
    // Get workload for each technician
    const techniciansWithWorkload = await Promise.all(
      technicians.map(async (tech) => {
        const activeTests = await LabTest.countDocuments({
          assignedTechnician: tech._id,
          status: { $in: ['assigned', 'in-progress'] }
        });
        
        return {
          ...tech.toObject(),
          currentWorkload: activeTests
        };
      })
    );
    
    res.json({
      success: true,
      data: { technicians: techniciansWithWorkload }
    });
  } catch (error) {
    console.error('Get available lab technicians error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available lab technicians',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  getAllLabTests,
  getLabTestById,
  createLabTest,
  updateLabTestStatus,
  uploadLabResults,
  reviewLabTest,
  getLabTestsForAppointment,
  getAllLabTechnicians,
  getAvailableLabTechnicians
};