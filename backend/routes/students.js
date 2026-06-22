// Student Routes (RBAC)
const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const authMiddleware = require('../middleware/auth');
const { requireRole } = require('../middleware/roleAccess');

router.use(authMiddleware);
router.use(requireRole(['student']));

router.get('/profile', studentController.getProfile);
router.get('/attendance', studentController.getAttendance);
router.get('/marks', studentController.getMarks);
router.get('/fees', studentController.getFees);
router.post('/leave', studentController.applyLeave);
router.post('/documents', studentController.requestDocument);

module.exports = router;


