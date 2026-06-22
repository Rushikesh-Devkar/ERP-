const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { requireRole } = require('../middleware/roleAccess');
const schoolController = require('../controllers/schoolController');

// settings: admin/principal only (simple)
router.use(authMiddleware);
router.use(requireRole(['admin', 'principal']));

router.get('/', schoolController.getSchool);
router.put('/', schoolController.upsertSchool);

module.exports = router;

