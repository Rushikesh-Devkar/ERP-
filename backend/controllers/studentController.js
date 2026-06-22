// Student Controller - Student dashboard features
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Marks = require('../models/Marks');
const Fees = require('../models/Fees');
const LeaveRequest = require('../models/LeaveRequest');
const DocumentRequest = require('../models/DocumentRequest');
const User = require('../models/User');

// Get student profile
exports.getProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.userId }).populate('userId');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get attendance
exports.getAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find({ studentId: req.query.studentId }).sort({ date: -1 }).limit(30);
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get marks
exports.getMarks = async (req, res) => {
  try {
    const marks = await Marks.find({ studentId: req.query.studentId });
    res.json(marks);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get fees
exports.getFees = async (req, res) => {
  try {
    const fees = await Fees.findOne({ studentId: req.query.studentId });
    res.json(fees || {});
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Apply for leave
exports.applyLeave = async (req, res) => {
  try {
    const leaveRequest = new LeaveRequest({
      ...req.body,
      userId: req.user.userId
    });
    await leaveRequest.save();
    res.status(201).json({ message: 'Leave request submitted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Request document
exports.requestDocument = async (req, res) => {
  try {
    const documentRequest = new DocumentRequest({
      ...req.body,
      userId: req.user.userId
    });
    await documentRequest.save();
    res.status(201).json({ message: 'Document request submitted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

