const express = require('express');
const {
  getAdminDashboard,
  getPatientDashboard,
  getPharmacyStats
} = require('../controllers/dashboard.controller');
const {
  authenticateToken,
  authorizeRoles
} = require('../middleware/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Routes
router.get('/admin', 
  authorizeRoles('admin', 'doctor', 'nurse'), 
  getAdminDashboard
);

router.get('/patient', 
  authorizeRoles('patient'), 
  getPatientDashboard
);

router.get('/pharmacy', 
  getPharmacyStats
);

module.exports = router;