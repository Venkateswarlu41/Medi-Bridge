const express = require('express');
const { body } = require('express-validator');
const {
  getAllLabTests,
  getLabTestById,
  createLabTest,
  updateLabTestStatus,
  uploadLabResults,
  reviewLabTest,
  getLabTestsForAppointment,
  getAllLabTechnicians,
  getAvailableLabTechnicians
} = require('../controllers/labTest.controller');
const {
  authenticateToken,
  authorizeRoles
} = require('../middleware/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Validation rules
const createLabTestValidation = [
  body('appointmentId')
    .isMongoId()
    .withMessage('Valid appointment ID is required'),
  body('testName')
    .notEmpty()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Test name is required and must be less than 200 characters'),
  body('testType')
    .isIn(['blood', 'urine', 'imaging', 'pathology', 'microbiology', 'biochemistry', 'hematology', 'other'])
    .withMessage('Valid test type is required'),
  body('priority')
    .optional()
    .isIn(['routine', 'urgent', 'stat'])
    .withMessage('Invalid priority level'),
  body('assignedTechnician')
    .optional()
    .isMongoId()
    .withMessage('Valid technician ID required'),
  body('clinicalIndication')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Clinical indication must be less than 500 characters'),
  body('specialInstructions')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Special instructions must be less than 500 characters')
];

const uploadResultsValidation = [
  body('results')
    .optional()
    .isArray()
    .withMessage('Results must be an array'),
  body('results.*.parameter')
    .optional()
    .isString()
    .withMessage('Parameter must be a string'),
  body('results.*.value')
    .optional()
    .isString()
    .withMessage('Value must be a string'),
  body('results.*.unit')
    .optional()
    .isString()
    .withMessage('Unit must be a string'),
  body('results.*.normalRange')
    .optional()
    .isString()
    .withMessage('Normal range must be a string'),
  body('results.*.status')
    .optional()
    .isIn(['normal', 'abnormal', 'critical', 'inconclusive'])
    .withMessage('Invalid result status'),
  body('interpretation')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Interpretation must be less than 1000 characters'),
  body('conclusion')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Conclusion must be less than 500 characters'),
  body('recommendations')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Recommendations must be less than 500 characters')
];

const reviewValidation = [
  body('comments')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Comments must be less than 1000 characters'),
  body('actionTaken')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Action taken must be less than 500 characters')
];

// Routes
router.get('/', 
  authorizeRoles('admin', 'doctor', 'lab_technician', 'patient'), 
  getAllLabTests
);

router.get('/technicians/all', 
  authorizeRoles('admin'), 
  getAllLabTechnicians
);

router.get('/technicians/available', 
  authorizeRoles('admin', 'doctor'), 
  getAvailableLabTechnicians
);

router.get('/appointment/:appointmentId', 
  authorizeRoles('admin', 'doctor', 'lab_technician'), 
  getLabTestsForAppointment
);

router.get('/:id', 
  authorizeRoles('admin', 'doctor', 'lab_technician', 'patient'), 
  getLabTestById
);

router.post('/', 
  authorizeRoles('doctor'), 
  createLabTestValidation, 
  createLabTest
);

router.patch('/:id/status', 
  authorizeRoles('admin', 'lab_technician'), 
  body('status').isIn(['requested', 'assigned', 'in-progress', 'completed', 'cancelled']),
  updateLabTestStatus
);

router.post('/:id/results', 
  authorizeRoles('lab_technician'), 
  uploadResultsValidation, 
  uploadLabResults
);

router.post('/:id/review', 
  authorizeRoles('doctor'), 
  reviewValidation, 
  reviewLabTest
);

module.exports = router;