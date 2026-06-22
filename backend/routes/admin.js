// Admin Routes (RBAC)
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/auth');
const { requireRole } = require('../middleware/roleAccess');

router.use(authMiddleware);
router.use(requireRole(['admin']));

router.post('/students', adminController.createStudent);
router.post('/staff', adminController.createStaff);
router.get('/students', adminController.getAllStudents);
router.get('/staff/stats', adminController.getStaffStats);
router.get('/teachers', adminController.getTeachers);
router.get('/staff', adminController.getAllStaff);
router.get('/staff/:id', adminController.getStaffById);
router.put('/staff/:id', adminController.updateStaff);
router.patch('/staff/:id/suspend', adminController.suspendStaff);
router.delete('/staff/:id', adminController.deleteStaff);

module.exports = router;


