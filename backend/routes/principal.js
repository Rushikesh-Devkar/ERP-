// Principal Routes (RBAC)
const express = require('express');
const router = express.Router();
const principalController = require('../controllers/principalController');
const authMiddleware = require('../middleware/auth');
const { requireRole } = require('../middleware/roleAccess');

router.use(authMiddleware);
router.use(requireRole(['principal']));

router.get('/attendance-report', principalController.getAttendanceReport);
router.get('/marks-report', principalController.getMarksReport);
router.put('/leaves/:id', principalController.updateLeaveStatus);


module.exports = router;


