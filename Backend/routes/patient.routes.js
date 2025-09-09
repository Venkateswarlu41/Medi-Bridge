const express = require('express');
const { body } = require('express-validator');
const {
  getAllPatients,
  getPatientById,
  updatePatient,
  addVitalSigns,
  getPatientHistory,
  addPatientNote
} = require('../controllers/patient.controller');
const {
  authenticateToken,
  authorizeRoles,
  authorizePatientAccess
} = require('../middleware/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Validation rules
const updatePatientValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .matches(/^\+?[\d\s-()]+$/)
    .withMessage('Please provide a valid phone number'),
  body('bloodGroup')
    .optional()
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Please provide a valid blood group')
];

const vitalSignsValidation = [
  body('height')
    .optional()
    .isFloat({ min: 50, max: 250 })
    .withMessage('Height must be between 50 and 250 cm'),
  body('weight')
    .optional()
    .isFloat({ min: 1, max: 500 })
    .withMessage('Weight must be between 1 and 500 kg'),
  body('bloodPressure.systolic')
    .optional()
    .isInt({ min: 70, max: 250 })
    .withMessage('Systolic pressure must be between 70 and 250 mmHg'),
  body('bloodPressure.diastolic')
    .optional()
    .isInt({ min: 40, max: 150 })
    .withMessage('Diastolic pressure must be between 40 and 150 mmHg'),
  body('heartRate')
    .optional()
    .isInt({ min: 30, max: 200 })
    .withMessage('Heart rate must be between 30 and 200 bpm'),
  body('temperature')
    .optional()
    .isFloat({ min: 30, max: 45 })
    .withMessage('Temperature must be between 30 and 45°C'),
  body('respiratoryRate')
    .optional()
    .isInt({ min: 5, max: 60 })
    .withMessage('Respiratory rate must be between 5 and 60 breaths per minute'),
  body('oxygenSaturation')
    .optional()
    .isInt({ min: 70, max: 100 })
    .withMessage('Oxygen saturation must be between 70 and 100%')
];

const noteValidation = [
  body('content')
    .notEmpty()
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Note content must be between 1 and 1000 characters'),
  body('type')
    .optional()
    .isIn(['general', 'medical', 'administrative', 'billing'])
    .withMessage('Invalid note type')
];

// Routes
router.get('/', authorizeRoles('admin', 'doctor', 'nurse'), getAllPatients);

router.get('/:id', authorizePatientAccess, getPatientById);

router.put('/:id', 
  authorizeRoles('admin', 'doctor', 'nurse'), 
  updatePatientValidation, 
  updatePatient
);

router.post('/:id/vital-signs', 
  authorizeRoles('admin', 'doctor', 'nurse'), 
  vitalSignsValidation, 
  addVitalSigns
);

router.get('/:id/history', authorizePatientAccess, getPatientHistory);

router.post('/:id/notes', 
  authorizeRoles('admin', 'doctor', 'nurse'), 
  noteValidation, 
  addPatientNote
);

module.exports = router;