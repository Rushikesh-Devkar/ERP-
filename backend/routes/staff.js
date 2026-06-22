// Staff Routes (RBAC)
const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const authMiddleware = require('../middleware/auth');
const { requireRole } = require('../middleware/roleAccess');

router.use(authMiddleware);
router.use(requireRole(['staff']));

router.get('/students', staffController.getStudents);
router.post('/attendance', staffController.markAttendance);
router.post('/marks', staffController.uploadMarks);
router.post('/leaves', staffController.applyLeave);
router.get('/leaves', staffController.getLeaveRequests);


module.exports = router;


