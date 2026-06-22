// Principal Controller - Principal dashboard features
const Attendance = require('../models/Attendance');
const Marks = require('../models/Marks');
const Fees = require('../models/Fees');
const LeaveRequest = require('../models/LeaveRequest');
const Student = require('../models/Student');

// Get attendance report (Enterprise)
// Scopes by classId/sectionId/date range optionally.
exports.getAttendanceReport = async (req, res) => {
  try {
    const { classId, sectionId, from, to } = req.query;

    const match = {};
    if (classId) match.classId = classId;
    if (sectionId) match.sectionId = sectionId;
    if (from || to) {
      const f = from ? new Date(from) : new Date(0);
      const t = to ? new Date(to) : new Date();
      match.date = { $gte: f, $lte: t };
    }

    const pipeline = [
      { $match: match },
      { $unwind: '$entries' },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$date' },
          },
          present: {
            $sum: {
              $cond: [{ $eq: ['$entries.status', 'Present'] }, 1, 0],
            },
          },
          absent: {
            $sum: {
              $cond: [{ $eq: ['$entries.status', 'Absent'] }, 1, 0],
            },
          },
          leave: {
            $sum: {
              $cond: [{ $eq: ['$entries.status', 'Leave'] }, 1, 0],
            },
          },
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ];

    const report = await Attendance.aggregate(pipeline);
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// Get marks report
exports.getMarksReport = async (req, res) => {
  try {
    const marks = await Marks.aggregate([
      {
        $group: {
          _id: '$subject',
          average: { $avg: '$marks' },
          highest: { $max: '$marks' },
          lowest: { $min: '$marks' }
        }
      }
    ]);
    res.json(marks);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Approve/Reject leave by principal
// Expected body: { status: 'approved'|'rejected', note? }
exports.updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note = '' } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'status must be approved or rejected' });
    }

    const principalUserId = req.user?.userId;

    const leaveRequest = await LeaveRequest.findByIdAndUpdate(
      id,
      {
        status: status === 'approved' ? 'approved' : 'rejected',
        principalDecision: {
          status: status === 'approved' ? 'approved' : 'rejected',
          decidedByPrincipalId: principalUserId,
          decidedAt: new Date(),
          note
        },
      },
      { new: true }
    ).populate('requestedByUserId');

    res.json({ message: 'Leave status updated', leaveRequest });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


