const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token - user not found'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

// Check if user has required role(s)
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${roles.join(', ')}`
      });
    }

    next();
  };
};

// Check if user can access patient data
const authorizePatientAccess = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const user = req.user;

    // Admin and doctors can access all patient data
    if (['admin', 'doctor'].includes(user.role)) {
      return next();
    }

    // Patients can only access their own data
    if (user.role === 'patient') {
      if (user._id.toString() !== patientId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only access your own data'
        });
      }
      return next();
    }

    // Lab technicians can access patient data for their tests
    if (user.role === 'lab_technician') {
      // Additional logic can be added here to check if the lab technician
      // has tests associated with this patient
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  } catch (error) {
    console.error('Patient access authorization error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authorization error'
    });
  }
};

// Check if user can access appointment data
const authorizeAppointmentAccess = async (req, res, next) => {
  try {
    const { id } = req.params;  // Changed from appointmentId to id
    const user = req.user;

    // Admin can access all appointments
    if (user.role === 'admin') {
      return next();
    }

    // For other roles, we need to check the appointment details
    const Appointment = require('../models/appointment.model');
    const appointment = await Appointment.findById(id);  // Using id instead of appointmentId

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Doctors can access their own appointments
    if (user.role === 'doctor' && appointment.doctor.toString() === user._id.toString()) {
      return next();
    }

    // Patients can access their own appointments
    if (user.role === 'patient' && appointment.patient.toString() === user._id.toString()) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  } catch (error) {
    console.error('Appointment access authorization error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authorization error'
    });
  }
};

// Optional authentication (for public endpoints that can benefit from user context)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Ignore errors for optional auth
    next();
  }
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  authorizePatientAccess,
  authorizeAppointmentAccess,
  optionalAuth
};