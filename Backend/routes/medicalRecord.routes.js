const express = require('express');
const { body } = require('express-validator');
const {
  getAllMedicalRecords,
  getMedicalRecordById,
  createMedicalRecord,
  updateMedicalRecord,
  addAmendment,
  addLabResult,
  getPatientMedicalHistory,
  reviewMedicalRecord
} = require('../controllers/medicalRecord.controller');
const {
  authenticateToken,
  authorizeRoles
} = require('../middleware/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Validation rules
const createRecordValidation = [
  body('patient')
    .isMongoId()
    .withMessage('Valid patient ID is required'),
  body('doctor')
    .optional()
    .isMongoId()
    .withMessage('Valid doctor ID is required'),
  body('department')
    .isMongoId()
    .withMessage('Valid department ID is required'),
  body('recordType')
    .isIn(['consultation', 'lab-result', 'imaging', 'procedure', 'discharge-summary', 'prescription', 'vaccination'])
    .withMessage('Valid record type is required'),
  body('recordDate')
    .optional()
    .isISO8601()
    .withMessage('Valid record date is required')
];

const amendmentValidation = [
  body('reason')
    .notEmpty()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Amendment reason is required and must be less than 500 characters'),
  body('changes')
    .notEmpty()
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Amendment changes description is required and must be less than 1000 characters')
];

const labResultValidation = [
  body('testName')
    .notEmpty()
    .trim()
    .withMessage('Test name is required'),
  body('result')
    .notEmpty()
    .trim()
    .withMessage('Test result is required'),
  body('status')
    .isIn(['normal', 'abnormal', 'critical', 'pending'])
    .withMessage('Valid status is required'),
  body('performedDate')
    .optional()
    .isISO8601()
    .withMessage('Valid performed date is required')
];

// Routes
router.get('/', 
  authorizeRoles('admin', 'doctor', 'patient', 'lab_technician'), 
  getAllMedicalRecords
);

router.get('/patient/:patientId/history', 
  authorizeRoles('admin', 'doctor', 'patient'), 
  getPatientMedicalHistory
);

// Route for patients to get their own medical history
router.get('/patient/me/history', 
  authorizeRoles('patient'), 
  (req, res, next) => {
    // Set the patientId to the current user's ID for patients
    req.params.patientId = req.user._id.toString();
    next();
  },
  getPatientMedicalHistory
);

router.get('/:id', 
  authorizeRoles('admin', 'doctor', 'patient', 'lab_technician'), 
  getMedicalRecordById
);

router.post('/', 
  authorizeRoles('admin', 'doctor'), 
  createRecordValidation, 
  createMedicalRecord
);

router.put('/:id', 
  authorizeRoles('admin', 'doctor'), 
  createRecordValidation, 
  updateMedicalRecord
);

router.post('/:id/amendments', 
  authorizeRoles('admin', 'doctor'), 
  amendmentValidation, 
  addAmendment
);

router.post('/:id/lab-results', 
  authorizeRoles('admin', 'doctor', 'lab_technician'), 
  labResultValidation, 
  addLabResult
);

router.patch('/:id/review', 
  authorizeRoles('admin', 'doctor'), 
  reviewMedicalRecord
);

module.exports = router;