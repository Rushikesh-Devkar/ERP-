const mongoose = require('mongoose');

const attendanceCorrectionSchema = new mongoose.Schema(
  {
    // entityType: 'student' | 'staff'
    entityType: { type: String, enum: ['student', 'staff'], required: true, index: true },

    // Which record is being corrected
    studentAttendanceId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentAttendance', default: null },
    staffAttendanceId: { type: mongoose.Schema.Types.ObjectId, ref: 'StaffAttendance', default: null },

    // Fine-grained (optional)
    entryStudentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', default: null },

    // Admin requested before/after state
    before: { type: mongoose.Schema.Types.Mixed, default: {} },
    after: { type: mongoose.Schema.Types.Mixed, default: {} },

    // Correction flow
    requestedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    approvedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    approvedAt: { type: Date, default: null },

    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },

    note: { type: String, default: '' },

    audit: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AttendanceCorrection', attendanceCorrectionSchema);

