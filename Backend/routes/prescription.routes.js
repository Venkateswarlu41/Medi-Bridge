const express = require('express');
const { body } = require('express-validator');
const {
  getAllPrescriptions,
  getPrescriptionById,
  createPrescription,
  updatePrescription,
  cancelPrescription,
  getAvailableMedications
} = require('../controllers/prescription.controller');
const {
  authenticateToken,
  authorizeRoles
} = require('../middleware/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Validation rules
const createPrescriptionValidation = [
  body('patientId')
    .isMongoId()
    .withMessage('Valid patient ID is required'),
  body('diagnosis')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Diagnosis must be less than 500 characters'),
  body('symptoms')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Symptoms must be less than 500 characters'),
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes must be less than 1000 characters'),
  body('specialInstructions')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Special instructions must be less than 500 characters'),
  body('medications')
    .isArray({ min: 1 })
    .withMessage('At least one medication is required'),
  body('medications.*.medicationId')
    .isMongoId()
    .withMessage('Valid medication ID is required'),
  body('medications.*.dosage.amount')
    .isNumeric()
    .isFloat({ min: 0.1 })
    .withMessage('Valid dosage amount is required'),
  body('medications.*.dosage.unit')
    .isIn(['mg', 'g', 'ml', 'mcg', 'iu', 'tablet', 'capsule', 'drop', 'tsp', 'tbsp'])
    .withMessage('Valid dosage unit is required'),
  body('medications.*.frequency')
    .isIn(['once-daily', 'twice-daily', 'three-times-daily', 'four-times-daily', 'every-6-hours', 'every-8-hours', 'every-12-hours', 'as-needed', 'custom'])
    .withMessage('Valid frequency is required'),
  body('medications.*.duration.value')
    .isInt({ min: 1 })
    .withMessage('Valid duration value is required'),
  body('medications.*.duration.unit')
    .isIn(['days', 'weeks', 'months'])
    .withMessage('Valid duration unit is required'),
  body('medications.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Valid quantity is required'),
  body('medications.*.route')
    .optional()
    .isIn(['oral', 'intravenous', 'intramuscular', 'subcutaneous', 'topical', 'inhalation', 'nasal', 'rectal', 'other'])
    .withMessage('Valid route is required'),
  body('medications.*.refills')
    .optional()
    .isInt({ min: 0, max: 5 })
    .withMessage('Refills must be between 0 and 5'),
  body('validityDays')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Validity days must be between 1 and 365')
];

const updatePrescriptionValidation = [
  body('diagnosis')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Diagnosis must be less than 500 characters'),
  body('symptoms')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Symptoms must be less than 500 characters'),
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes must be less than 1000 characters'),
  body('specialInstructions')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Special instructions must be less than 500 characters')
];

const cancelPrescriptionValidation = [
  body('reason')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Reason must be less than 200 characters')
];

// Routes
router.get('/', 
  authorizeRoles('admin', 'doctor', 'patient', 'pharmacist'), 
  getAllPrescriptions
);

router.get('/medications/available', 
  authorizeRoles('admin', 'doctor', 'pharmacist'), 
  getAvailableMedications
);

router.get('/:id', 
  authorizeRoles('admin', 'doctor', 'patient', 'pharmacist'), 
  getPrescriptionById
);

router.post('/', 
  authorizeRoles('doctor'), 
  createPrescriptionValidation, 
  createPrescription
);

router.put('/:id', 
  authorizeRoles('doctor'), 
  updatePrescriptionValidation, 
  updatePrescription
);

router.patch('/:id/cancel', 
  authorizeRoles('admin', 'doctor'), 
  cancelPrescriptionValidation, 
  cancelPrescription
);

module.exports = router;