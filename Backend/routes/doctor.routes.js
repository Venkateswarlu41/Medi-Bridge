const express = require('express');
const { query } = require('express-validator');
const {
  getAllDoctors,
  getDoctorById,
  getDoctorSchedule,
  getDoctorPatients,
  getDoctorDashboard
} = require('../controllers/doctor.controller');
const {
  authenticateToken,
  authorizeRoles,
  optionalAuth
} = require('../middleware/auth.middleware');

const router = express.Router();

// Routes
// Get all doctors - use optional auth to allow both authenticated and unauthenticated access
router.get('/', optionalAuth, getAllDoctors);

router.get('/dashboard', 
  authenticateToken,
  authorizeRoles('doctor'), 
  getDoctorDashboard
);

router.get('/:id', authenticateToken, getDoctorById);

router.get('/:id/schedule', 
  authenticateToken,
  query('date').optional().isISO8601(),
  query('week').optional().isISO8601(),
  query('month').optional().matches(/^\d{4}-\d{2}$/),
  getDoctorSchedule
);

router.get('/:id/patients', 
  authenticateToken,
  authorizeRoles('admin', 'doctor'), 
  getDoctorPatients
);

module.exports = router;