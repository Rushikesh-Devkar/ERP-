const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth');
const { requireRole } = require('../middleware/roleAccess');

const attendanceController = require('../controllers/attendanceController');

// Student + Staff + Admin APIs are role-scoped where needed.

// Admin: view/search/edit/correct/export etc (basic hooks only here)
router.use(authMiddleware);

router.get('/admin/attendance/students', requireRole(['admin']), attendanceController.getStudentAttendance);
router.put('/admin/attendance/students/:id', requireRole(['admin']), attendanceController.editStudentAttendance);
router.post('/admin/attendance/students/:id/correct', requireRole(['admin']), attendanceController.correctStudentAttendance);
router.delete('/admin/attendance/students/:id', requireRole(['admin']), attendanceController.deleteStudentAttendanceEntry);

router.get('/admin/attendance/staff', requireRole(['admin']), attendanceController.getStaffAttendance);
router.post('/admin/attendance/corrections/staff/:id/approve', requireRole(['admin']), attendanceController.approveStaffCorrection);

// Device punch ingestion (no RBAC; assumes network is protected). Still protected by authMiddleware per current system.
// If you have a real device token, reuse it; for now, allow via a shared header.
// For minimal integration with existing auth, we require a token but device can call with a special service user role.
router.post('/attendance/punch', attendanceController.ingestStaffPunch);

module.exports = router;

