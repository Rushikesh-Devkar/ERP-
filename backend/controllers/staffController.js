// Staff Controller - Teacher dashboard features
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Marks = require('../models/Marks');
const LeaveRequest = require('../models/LeaveRequest');
const Staff = require('../models/Staff');

// View assigned students (Enterprise placeholder)
// In production, this must be scoped by TeacherAssignment for req.user (staff).
exports.getStudents = async (req, res) => {
  try {
    const { classId, sectionId } = req.query;

    // Fallback to all students if filters not provided.
    const filter = {};
    if (classId) filter.classId = classId;
    if (sectionId) filter.sectionId = sectionId;

    const students = await Student.find(filter).populate('userId', 'name email');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// Take attendance (Enterprise)
// Expected body:
// {
//   classId, sectionId, subjectId?, date, entries: [{ studentId, status: 'Present'|'Absent'|'Leave' }]
// }
exports.markAttendance = async (req, res) => {
  try {
    const { classId, sectionId, subjectId = null, date, entries = [] } = req.body;
    const markedByStaffId = req.user?.userId || null;

    if (!classId || !sectionId || !date) {
      return res.status(400).json({ message: 'classId, sectionId and date are required' });
    }
    if (!Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ message: 'entries is required and cannot be empty' });
    }

    // One attendance document per (date,class,section,subject?)
    const filter = {
      date: new Date(date),
      classId,
      sectionId,
      subjectId: subjectId || null,
    };

    // Normalize date to day-level range to match uniqueness expectations
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
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// Upload marks
exports.uploadMarks = async (req, res) => {
  try {
    const { studentId, subject, marks } = req.body;
    
    // Update or create marks
    await Marks.findOneAndUpdate(
      { studentId, subject },
      { studentId, subject, marks },
      { upsert: true, new: true }
    );
    
    res.json({ message: 'Marks uploaded successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Staff: apply leave
// Expected body:
// { reason, leaveType, fromDate, toDate }
exports.applyLeave = async (req, res) => {
  try {
    const { reason, leaveType, fromDate, toDate } = req.body;
    const staffId = req.user?.userId || null;

    if (!staffId) return res.status(401).json({ message: 'Unauthorized' });
    if (!reason || !fromDate || !toDate) {
      return res.status(400).json({ message: 'reason, fromDate and toDate are required' });
    }

    const from = new Date(fromDate);
    const to = new Date(toDate);
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      return res.status(400).json({ message: 'Invalid dates' });
    }

    const leaveRequest = new LeaveRequest({
      requestedByRole: 'staff',
      staffId,
      requestedByUserId: req.user?.userId || null,
      reason,
      leaveType: leaveType || 'Casual',
      fromDate: from,
      toDate: to,
      status: 'pending_teacher', // staff leave: still flows through teacher->principal in your model
    });

    await leaveRequest.save();
    res.json({ message: 'Leave request submitted', leaveRequest });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// View leave requests for staff (their history)
exports.getLeaveRequests = async (req, res) => {
  try {
    const staffId = req.user?.userId;
    const leaveRequests = await LeaveRequest.find({ staffId: staffId || null }).sort({ createdAt: -1 });
    res.json(leaveRequests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


