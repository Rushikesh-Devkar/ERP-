const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth');
const { requireRole } = require('../middleware/roleAccess');

const admissionController = require('../controllers/admissionController');

router.use(authMiddleware);
router.use(requireRole(['admin']));

// Create new admission application (multipart)
router.post('/new', admissionController.createAdmission);

// List admissions with pagination/search/status
router.get('/', admissionController.listAdmissions);

// Get admission by id
router.get('/:id', admissionController.getAdmissionById);

// Update status
router.put('/:id/status', admissionController.updateAdmissionStatus);

// Soft delete (or delete)
router.delete('/:id', admissionController.deleteAdmission);

module.exports = router;

