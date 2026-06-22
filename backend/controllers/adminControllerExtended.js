// Admin Controller - Extended admin dashboard features
// Provides backend APIs for Admissions, Attendance, Classes, Subjects, Exams & Results,
// Fee Collection/Reports, Notices, Messages, Reports and Settings.

const User = require('../models/User');
const Student = require('../models/Student');
const Staff = require('../models/Staff');

const ClassModel = require('../models/Class');
const Section = require('../models/Section');
const Subject = require('../models/Subject');
const Attendance = require('../models/Attendance');
const Exam = require('../models/Exam');
const Marks = require('../models/Marks');

const Fees = require('../models/Fees');
const FeeRecord = require('../models/FeeRecord');
const Payment = require('../models/Payment');

const Announcement = require('../models/Announcement');
const Notification = require('../models/Notification');

const LeaveRequest = require('../models/LeaveRequest');
const DocumentRequest = require('../models/DocumentRequest');

// Helpers
const toObjectId = (v) => (v ? v : undefined);

// ----------------------------
// Admissions
// ----------------------------
// Create admission (create user+student+fees)
exports.createAdmission = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      class: studentClass,
      section,
      rollNo,
      parentName,
      initialFeesTotal = 50000,
    } = req.body;

    if (!name || !email || !password || !studentClass || !rollNo) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const user = new User({ name, email, password, role: 'student' });
    await user.save();

    // student model currently uses: userId, class, rollNo, parentName (per adminController)
    const student = new Student({
      userId: user._id,
      class: studentClass,
      rollNo,
      parentName,
      sectionId: section || undefined,
    });
    await student.save();

    await Fees.findOneAndUpdate(
      { studentId: student._id },
      { studentId: student._id, totalFees: initialFeesTotal, paidFees: 0 },
      { upsert: true, new: true }
    );

    res.status(201).json({ message: 'Admission created successfully', student });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.listAdmissions = async (req, res) => {
  try {
    // Lightweight: list students
    const students = await Student.find({}).populate('userId');
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ----------------------------
// Attendance
// ----------------------------
exports.getAttendance = async (req, res) => {
  try {
    const { classId, sectionId, from, to } = req.query;
    const match = {};
    if (classId) match.classId = toObjectId(classId);
    if (sectionId) match.sectionId = toObjectId(sectionId);

    if (from || to) {
      const f = from ? new Date(from) : new Date(0);
      const t = to ? new Date(to) : new Date();
      match.date = { $gte: f, $lte: t };
    }

    const data = await Attendance.find(match).sort({ date: -1 }).limit(100);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Save attendance for admin (same schema as staff)
exports.markAttendanceAdmin = async (req, res) => {
  try {
    const { classId, sectionId, subjectId = null, date, entries = [] } = req.body;
    const markedByStaffId = req.user?.userId || null;

    if (!classId || !sectionId || !date) {
      return res.status(400).json({ message: 'classId, sectionId and date are required' });
    }
    if (!Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ message: 'entries is required and cannot be empty' });
    }

    const dayStart = new Date(new Date(date).setHours(0, 0, 0, 0));
    const dayEnd = new Date(new Date(date).setHours(23, 59, 59, 999));

    const existing = await Attendance.findOne({
      classId,
      sectionId,
      subjectId: subjectId || null,
      date: { $gte: dayStart, $lte: dayEnd },
    });

    if (existing) {
      existing.entries = entries;
      existing.markedByStaffId = markedByStaffId;
      existing.date = dayStart;
      await existing.save();
      return res.json({ message: 'Attendance updated successfully', attendance: existing });
    }

    const attendance = new Attendance({
      classId,
      sectionId,
      subjectId: subjectId || null,
      date: dayStart,
      markedByStaffId,
      entries,
    });

    await attendance.save();
    res.json({ message: 'Attendance marked successfully', attendance });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ----------------------------
// Classes & Sections
// ----------------------------
exports.createClass = async (req, res) => {
  try {
    const { name, sortOrder = 0 } = req.body;
    if (!name) return res.status(400).json({ message: 'name is required' });
    const doc = await ClassModel.create({ name, sortOrder });
    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.listClasses = async (req, res) => {
  try {
    const classes = await ClassModel.find({}).sort({ sortOrder: 1, createdAt: -1 });
    res.json(classes);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.createSection = async (req, res) => {
  try {
    const { classId, name, sortOrder = 0 } = req.body;
    if (!classId || !name) return res.status(400).json({ message: 'classId and name are required' });
    const doc = await Section.create({ classId, name, sortOrder });
    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.listSections = async (req, res) => {
  try {
    const { classId } = req.query;
    const q = classId ? { classId: toObjectId(classId) } : {};
    const sections = await Section.find(q).sort({ sortOrder: 1, createdAt: -1 });
    res.json(sections);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ----------------------------
// Subjects
// ----------------------------
exports.createSubject = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'name is required' });
    const subject = await Subject.create({ name });
    res.status(201).json(subject);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.listSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({}).sort({ createdAt: -1 });
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ----------------------------
// Exams & Results
// ----------------------------
exports.createExam = async (req, res) => {
  try {
    const { classId, sectionId, subjectId, name, examDate, maxMarks = 100 } = req.body;
    if (!classId || !sectionId || !subjectId || !name || !examDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const exam = await Exam.create({ classId, sectionId, subjectId, name, examDate, maxMarks });
    res.status(201).json(exam);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.listExams = async (req, res) => {
  try {
    const { classId, sectionId } = req.query;
    const q = {};
    if (classId) q.classId = toObjectId(classId);
    if (sectionId) q.sectionId = toObjectId(sectionId);

    const exams = await Exam.find(q).sort({ examDate: -1 }).limit(100);
    res.json(exams);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// results summary (average per subject for a given examId if provided)
exports.getResultsSummary = async (req, res) => {
  try {
    const { examId } = req.query;
    const match = {};
    if (examId) match.examId = toObjectId(examId);

    const pipeline = [
      { $match: match },
      {
        $group: {
          _id: '$subjectId',
          average: { $avg: '$entries.marks' },
          // simplistic: compute max/min across entries.marks by unwinding
        },
      },
    ];

    // More correct: unwind entries
    const pipeline2 = [
      { $match: match },
      { $unwind: '$entries' },
      {
        $group: {
          _id: '$subjectId',
          average: { $avg: '$entries.marks' },
          highest: { $max: '$entries.marks' },
          lowest: { $min: '$entries.marks' },
        },
      },
      { $sort: { average: -1 } },
    ];

    const results = await Marks.aggregate(pipeline2);
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ----------------------------
// Fee Collection & Reports
// ----------------------------
exports.listFeeRecords = async (req, res) => {
  try {
    const { studentId } = req.query;
    const q = {};
    if (studentId) q.studentId = toObjectId(studentId);

    const records = await FeeRecord.find(q).sort({ createdAt: -1 }).limit(100);
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.payFee = async (req, res) => {
  try {
    const { feeRecordId, amount, paymentMethod = 'Cash', receiptNo = '' } = req.body;
    if (!feeRecordId || !amount) return res.status(400).json({ message: 'feeRecordId and amount are required' });

    const feeRecord = await FeeRecord.findById(feeRecordId);
    if (!feeRecord) return res.status(404).json({ message: 'Fee record not found' });

    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) return res.status(400).json({ message: 'Invalid amount' });

    const payment = await Payment.create({
      feeRecordId: feeRecord._id,
      paidByUserId: req.user?.userId,
      amount: amt,
      paymentMethod,
      receiptNo,
    });

    feeRecord.paidAmount = (feeRecord.paidAmount || 0) + amt;
    const remaining = (feeRecord.totalAmount || 0) - feeRecord.paidAmount;

    feeRecord.status = remaining <= 0 ? 'paid' : 'partially_paid';
    await feeRecord.save();

    res.status(201).json({ message: 'Payment successful', payment, feeRecord });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ----------------------------
// Notices, Messages, Reports, Settings
// ----------------------------
exports.createNotice = async (req, res) => {
  try {
    const { title, content, type = 'Notice', audienceRole = 'all' } = req.body;
    if (!title || !content) return res.status(400).json({ message: 'title and content are required' });

    const announcement = await Announcement.create({
      createdByUserId: req.user?.userId,
      audienceRole,
      title,
      content,
      type,
      // optional targetClassId / targetSectionId / dates
      targetClassId: req.body.targetClassId || null,
      targetSectionId: req.body.targetSectionId || null,
      startDate: req.body.startDate || null,
      endDate: req.body.endDate || null,
    });

    // Also create notifications (best-effort)
    await Notification.insertMany([
      // we cannot enumerate users without more querying; keep minimal.
    ]).catch(() => {});

    res.status(201).json(announcement);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.listNotices = async (req, res) => {
  try {
    const { audienceRole = 'all' } = req.query;
    const notices = await Announcement.find({
      type: { $in: ['Notice', 'Event', 'Exam'] },
      audienceRole,
    }).sort({ createdAt: -1 }).limit(50);

    res.json(notices);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// For this project, “messages” are handled as notifications. Create a notification for one user.
exports.sendMessage = async (req, res) => {
  try {
    const { userId, message, type = 'new_announcement', entityId = null } = req.body;
    if (!userId || !message) return res.status(400).json({ message: 'userId and message are required' });

    const n = await Notification.create({
      userId: toObjectId(userId),
      type,
      entityRef: entityId ? { type: 'entity', id: toObjectId(entityId) } : { type: 'system', id: toObjectId(req.user?.userId) },
      message,
      status: 'unread',
    });

    res.status(201).json(n);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.listUnreadMessages = async (req, res) => {
  try {
    const { userId } = req.query;
    const uid = userId ? toObjectId(userId) : req.user?.userId;
    const items = await Notification.find({ userId: uid, status: 'unread' }).sort({ createdAt: -1 }).limit(50);
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getReports = async (req, res) => {
  try {
    // Simple report stats
    const totalStudents = await Student.countDocuments();
    const totalStaff = await Staff.countDocuments();
    const totalClasses = await ClassModel.countDocuments();
    const totalSections = await Section.countDocuments();

    res.json({ totalStudents, totalStaff, totalClasses, totalSections });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getSettings = async (req, res) => {
  // No settings model yet; return stub.
  res.json({ message: 'Settings not implemented yet (stub).', items: [] });
};

// ----------------------------
// Shared “workflow” endpoints used by UI cards
// ----------------------------
exports.getPendingLeaveRequests = async (req, res) => {
  try {
    const items = await LeaveRequest.find({ status: { $in: ['pending_teacher', 'pending'] } })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('requestedByUserId');
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getPendingDocumentRequests = async (req, res) => {
  try {
    const items = await DocumentRequest.find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('userId');
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

