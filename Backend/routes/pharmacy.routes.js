const express = require('express');
const { body, query } = require('express-validator');
const {
  getAllMedications,
  getMedicationById,
  createMedication,
  updateMedication,
  deleteMedication,
  updateMedicationStock,
  getInventoryReport,
  getLowStockMedications,
  getExpiringMedications
} = require('../controllers/pharmacy.controller');
const {
  authenticateToken,
  authorizeRoles
} = require('../middleware/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Validation rules
const medicationValidation = [
  body('name')
    .notEmpty()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Medication name is required and must be less than 200 characters'),
  body('category')
    .isIn(['antibiotic', 'analgesic', 'antihypertensive', 'antidiabetic', 'antihistamine', 'antacid', 'vitamin', 'supplement', 'other'])
    .withMessage('Valid category is required'),
  body('dosageForm')
    .isIn(['tablet', 'capsule', 'syrup', 'injection', 'cream', 'ointment', 'drops', 'inhaler', 'patch'])
    .withMessage('Valid dosage form is required'),
  body('inventory.unitPrice')
    .isFloat({ min: 0 })
    .withMessage('Unit price must be a positive number'),
  body('inventory.sellingPrice')
    .isFloat({ min: 0 })
    .withMessage('Selling price must be a positive number'),
  body('inventory.currentStock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Current stock must be a non-negative integer'),
  body('inventory.minimumStock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum stock must be a non-negative integer'),
  body('inventory.reorderLevel')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Reorder level must be a non-negative integer')
];

const stockUpdateValidation = [
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  body('type')
    .isIn(['add', 'subtract', 'set'])
    .withMessage('Type must be add, subtract, or set'),
  body('reason')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Reason must be less than 500 characters')
];

// Routes
router.get('/medications', getAllMedications);

router.get('/medications/low-stock', 
  authorizeRoles('admin', 'doctor', 'nurse'), 
  getLowStockMedications
);

router.get('/medications/expiring', 
  authorizeRoles('admin', 'doctor', 'nurse'),
  query('days').optional().isInt({ min: 1, max: 365 }),
  getExpiringMedications
);

router.get('/inventory/report', 
  authorizeRoles('admin', 'doctor'), 
  getInventoryReport
);

router.get('/medications/:id', getMedicationById);

router.post('/medications', 
  authorizeRoles('admin', 'doctor'), 
  medicationValidation, 
  createMedication
);

router.put('/medications/:id', 
  authorizeRoles('admin', 'doctor'), 
  medicationValidation, 
  updateMedication
);

router.patch('/medications/:id/stock', 
  authorizeRoles('admin', 'doctor', 'nurse'), 
  stockUpdateValidation, 
  updateMedicationStock
);

router.delete('/medications/:id', 
  authorizeRoles('admin'), 
  deleteMedication
);

module.exports = router;