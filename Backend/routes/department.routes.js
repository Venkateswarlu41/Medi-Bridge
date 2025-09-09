const express = require('express');
const { body } = require('express-validator');
const {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentStaff,
  updateDepartmentEquipment
} = require('../controllers/department.controller');
const {
  authenticateToken,
  authorizeRoles
} = require('../middleware/auth.middleware');

const router = express.Router();

// Public route for registration (no auth required)
router.get('/public', async (req, res) => {
  try {
    const departments = await require('../models/department.model').find(
      { isActive: true },
      'name code description'
    ).sort({ name: 1 });
    
    res.json({
      success: true,
      data: departments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch departments'
    });
  }
});

// Seed default departments (no auth required for development)
router.post('/seed', async (req, res) => {
  try {
    const Department = require('../models/department.model');
    
    // Check if departments already exist
    const existingCount = await Department.countDocuments();
    if (existingCount > 0) {
      return res.json({
        success: true,
        message: 'Departments already exist',
        count: existingCount
      });
    }

    const defaultDepartments = [
      {
        name: 'Cardiology',
        code: 'CARD',
        description: 'Heart and cardiovascular system treatment',
        isActive: true
      },
      {
        name: 'Emergency Medicine',
        code: 'ER',
        description: 'Emergency and trauma care',
        isActive: true
      },
      {
        name: 'Pediatrics',
        code: 'PED',
        description: 'Medical care for infants, children, and adolescents',
        isActive: true
      },
      {
        name: 'Orthopedics',
        code: 'ORTH',
        description: 'Musculoskeletal system treatment',
        isActive: true
      },
      {
        name: 'Neurology',
        code: 'NEURO',
        description: 'Nervous system disorders treatment',
        isActive: true
      },
      {
        name: 'Oncology',
        code: 'ONCO',
        description: 'Cancer treatment and care',
        isActive: true
      },
      {
        name: 'General Surgery',
        code: 'SURG',
        description: 'Surgical procedures and operations',
        isActive: true
      },
      {
        name: 'Internal Medicine',
        code: 'IM',
        description: 'Adult internal medicine and primary care',
        isActive: true
      },
      {
        name: 'Psychiatry',
        code: 'PSYCH',
        description: 'Mental health and psychiatric care',
        isActive: true
      },
      {
        name: 'Radiology',
        code: 'RAD',
        description: 'Medical imaging and diagnostic services',
        isActive: true
      }
    ];

    const createdDepartments = await Department.insertMany(defaultDepartments);
    
    res.status(201).json({
      success: true,
      message: 'Default departments created successfully',
      data: createdDepartments,
      count: createdDepartments.length
    });
  } catch (error) {
    console.error('Seed departments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create default departments',
      error: error.message
    });
  }
});

// All other routes require authentication
router.use(authenticateToken);

// Validation rules
const departmentValidation = [
  body('name')
    .notEmpty()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Department name is required and must be less than 100 characters'),
  body('code')
    .notEmpty()
    .trim()
    .isLength({ min: 1, max: 10 })
    .withMessage('Department code is required and must be less than 10 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('head')
    .optional()
    .isMongoId()
    .withMessage('Valid head ID is required')
];

const equipmentValidation = [
  body('equipment')
    .isArray()
    .withMessage('Equipment must be an array'),
  body('equipment.*.name')
    .notEmpty()
    .trim()
    .withMessage('Equipment name is required'),
  body('equipment.*.status')
    .isIn(['operational', 'maintenance', 'out-of-order'])
    .withMessage('Valid equipment status is required')
];

// Routes
router.get('/', getAllDepartments);

router.get('/:id', getDepartmentById);

router.get('/:id/staff', getDepartmentStaff);

router.post('/', 
  authorizeRoles('admin'), 
  departmentValidation, 
  createDepartment
);

router.put('/:id', 
  authorizeRoles('admin'), 
  departmentValidation, 
  updateDepartment
);

router.patch('/:id/equipment', 
  authorizeRoles('admin', 'doctor'), 
  equipmentValidation, 
  updateDepartmentEquipment
);

router.delete('/:id', 
  authorizeRoles('admin'), 
  deleteDepartment
);

module.exports = router;