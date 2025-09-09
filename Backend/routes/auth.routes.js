const express = require('express');
const { body } = require('express-validator');
const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout,
  verifyToken
} = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('role')
    .optional()
    .isIn(['admin', 'doctor', 'patient', 'lab_technician', 'nurse', 'receptionist'])
    .withMessage('Invalid role'),
  body('phone')
    .optional()
    .matches(/^\+?[\d\s-()]+$/)
    .withMessage('Please provide a valid phone number'),
  body('dateOfBirth')
    .if((value, { req }) => req.body.role === 'patient')
    .isISO8601()
    .withMessage('Please provide a valid date of birth'),
  body('gender')
    .if((value, { req }) => req.body.role === 'patient')
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),
  body('bloodGroup')
    .if((value, { req }) => req.body.role === 'patient')
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Please provide a valid blood group'),
  body('specialization')
    .if((value, { req }) => req.body.role === 'doctor')
    .notEmpty()
    .withMessage('Specialization is required for doctors'),
  body('licenseNumber')
    .if((value, { req }) => req.body.role === 'doctor')
    .notEmpty()
    .withMessage('License number is required for doctors')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const updateProfileValidation = [
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
    .withMessage('Please provide a valid phone number')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number')
];

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// Protected routes
router.use(authenticateToken); // All routes below require authentication

router.get('/profile', getProfile);
router.put('/profile', updateProfileValidation, updateProfile);
router.put('/change-password', changePasswordValidation, changePassword);
router.post('/logout', logout);
router.get('/verify-token', verifyToken);

module.exports = router;