const express = require('express');
const { body, query } = require('express-validator');
const {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  updateAppointmentStatus,
  getDoctorAvailability
} = require('../controllers/appointment.controller');
const {
  authenticateToken,
  authorizeRoles,
  authorizeAppointmentAccess
} = require('../middleware/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Validation rules
const createAppointmentValidation = [
  body('patientId')
    .if((value, { req }) => req.user.role !== 'patient')
    .isMongoId()
    .withMessage('Valid patient ID is required'),
  body('doctorId')
    .isMongoId()
    .withMessage('Valid doctor ID is required'),
  body('departmentId')
    .isMongoId()
    .withMessage('Valid department ID is required'),
  body('appointmentDate')
    .isISO8601()
    .withMessage('Valid appointment date is required'),
  body('appointmentTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Valid appointment time is required (HH:MM format)'),
  body('duration')
    .optional()
    .isInt({ min: 15, max: 180 })
    .withMessage('Duration must be between 15 and 180 minutes'),
  body('type')
    .isIn(['consultation', 'follow-up', 'emergency', 'routine-checkup', 'procedure', 'telemedicine'])
    .withMessage('Valid appointment type is required'),
  body('chiefComplaint')
    .notEmpty()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Chief complaint is required and must be less than 500 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'urgent'])
    .withMessage('Invalid priority level')
];

const updateAppointmentValidation = [
  body('appointmentDate')
    .optional()
    .isISO8601()
    .withMessage('Valid appointment date is required'),
  body('appointmentTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Valid appointment time is required (HH:MM format)'),
  body('duration')
    .optional()
    .isInt({ min: 15, max: 180 })
    .withMessage('Duration must be between 15 and 180 minutes'),
  body('status')
    .optional()
    .isIn(['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show', 'rescheduled'])
    .withMessage('Invalid status'),
  body('notes')
    .optional()
    .isString()
    .isLength({ max: 1000 })
    .withMessage('Notes must be a string and less than 1000 characters')
];

const availabilityValidation = [
  query('doctorId')
    .isMongoId()
    .withMessage('Valid doctor ID is required'),
  query('date')
    .isISO8601()
    .withMessage('Valid date is required')
];

// Routes
router.get('/', getAllAppointments);

router.get('/availability', availabilityValidation, getDoctorAvailability);

// Specific appointment routes should come after general routes to avoid conflicts
router.get('/:id', authorizeAppointmentAccess, getAppointmentById);

router.post('/', 
  authorizeRoles('admin', 'doctor', 'patient', 'receptionist'), 
  createAppointmentValidation, 
  createAppointment
);

router.put('/:id', 
  authorizeAppointmentAccess,
  updateAppointmentValidation, 
  updateAppointment
);

router.patch('/:id/status', 
  authorizeRoles('admin', 'doctor'), 
  body('status').isIn(['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show']),
  updateAppointmentStatus
);

router.delete('/:id', 
  authorizeAppointmentAccess,
  body('reason').optional().isLength({ max: 500 }),
  cancelAppointment
);

module.exports = router;