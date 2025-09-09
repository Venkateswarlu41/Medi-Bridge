const express = require('express');
const { body, query } = require('express-validator');
const {
  getAllBills,
  getBillById,
  createBill,
  updateBill,
  processPayment,
  getBillingSummary,
  getOverdueBills
} = require('../controllers/billing.controller');
const {
  authenticateToken,
  authorizeRoles
} = require('../middleware/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Validation rules
const createBillValidation = [
  body('patientId')
    .isMongoId()
    .withMessage('Valid patient ID is required'),
  body('services')
    .isArray({ min: 1 })
    .withMessage('At least one service is required'),
  body('services.*.serviceType')
    .isIn(['consultation', 'procedure', 'lab-test', 'imaging', 'medication', 'room-charge', 'surgery', 'emergency', 'other'])
    .withMessage('Valid service type is required'),
  body('services.*.serviceName')
    .notEmpty()
    .trim()
    .withMessage('Service name is required'),
  body('services.*.quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  body('services.*.unitPrice')
    .isFloat({ min: 0 })
    .withMessage('Unit price must be a positive number'),
  body('services.*.totalPrice')
    .isFloat({ min: 0 })
    .withMessage('Total price must be a positive number'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Valid due date is required')
];

const paymentValidation = [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Payment amount must be greater than 0'),
  body('paymentMethod')
    .isIn(['cash', 'card', 'bank-transfer', 'cheque', 'insurance', 'online', 'upi'])
    .withMessage('Valid payment method is required'),
  body('transactionId')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Transaction ID must be less than 100 characters'),
  body('reference')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Reference must be less than 100 characters'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must be less than 500 characters')
];

// Routes
router.get('/', 
  authorizeRoles('admin', 'doctor', 'patient', 'receptionist'), 
  getAllBills
);

router.get('/summary', 
  authorizeRoles('admin', 'doctor'), 
  query('period').optional().isIn(['month', 'year']),
  query('year').optional().isInt({ min: 2020, max: 2030 }),
  query('month').optional().isInt({ min: 1, max: 12 }),
  getBillingSummary
);

router.get('/overdue', 
  authorizeRoles('admin', 'doctor', 'receptionist'), 
  getOverdueBills
);

router.get('/:id', 
  authorizeRoles('admin', 'doctor', 'patient', 'receptionist'), 
  getBillById
);

router.post('/', 
  authorizeRoles('admin', 'doctor', 'receptionist'), 
  createBillValidation, 
  createBill
);

router.put('/:id', 
  authorizeRoles('admin', 'doctor', 'receptionist'), 
  createBillValidation, 
  updateBill
);

router.post('/:id/payments', 
  authorizeRoles('admin', 'doctor', 'receptionist'), 
  paymentValidation, 
  processPayment
);

module.exports = router;