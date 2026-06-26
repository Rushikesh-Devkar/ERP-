// Admin Extended Routes - adds APIs for missing sidebar features

const express = require('express');
const router = express.Router();

const adminExtendedController = require('../controllers/adminControllerExtended');
const authMiddleware = require('../middleware/auth');
const { requireRole } = require('../middleware/roleAccess');

router.use(authMiddleware);
router.use(requireRole(['admin']));

// Admissions
router.post('/admissions', adminExtendedController.createAdmission);
router.get('/admissions', adminExtendedController.listAdmissions);

// Attendance (admin) - legacy endpoints (kept)
router.get('/attendance', adminExtendedController.getAttendance);
router.post('/attendance', adminExtendedController.markAttendanceAdmin);


// Classes/Sections
router.post('/classes', adminExtendedController.createClass);
router.get('/classes', adminExtendedController.listClasses);

router.post('/sections', adminExtendedController.createSection);
router.get('/sections', adminExtendedController.listSections);

// Subjects
router.post('/subjects', adminExtendedController.createSubject);
router.get('/subjects', adminExtendedController.listSubjects);

// Exams & Results
router.post('/exams', adminExtendedController.createExam);
router.get('/exams', adminExtendedController.listExams);

router.get('/results/summary', adminExtendedController.getResultsSummary);

// Fee Collection & Reports
router.get('/fee-records', adminExtendedController.listFeeRecords);
router.post('/fees/pay', adminExtendedController.payFee);

// Notices
router.post('/notices', adminExtendedController.createNotice);
router.get('/notices', adminExtendedController.listNotices);

// Messages
router.get('/messages/unread', adminExtendedController.listUnreadMessages);
router.post('/messages/send', adminExtendedController.sendMessage);

// Reports
router.get('/reports', adminExtendedController.getReports);

// Settings
router.get('/settings', adminExtendedController.getSettings);

// Dashboard workflow items
router.get('/workflow/pending-leaves', adminExtendedController.getPendingLeaveRequests);
router.get('/workflow/pending-doc-requests', adminExtendedController.getPendingDocumentRequests);

module.exports = router;

