const mongoose = require('mongoose');

const staffAttendanceSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true, index: true },

    staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true, index: true },
    employeeId: { type: String, required: true, index: true },

    deviceName: { type: String, default: '' },

    punchIn: { type: Date, default: null },
    punchOut: { type: Date, default: null },

    workingHours: { type: Number, default: 0 },
    overtimeHours: { type: Number, default: 0 },

    status: {
      type: String,
      enum: [
        'Present',
        'Absent',
        'Late',
        'Half Day',
        'Leave',
        'Holiday',
        'Work From Home',
      ],
      default: 'Absent',
      index: true,
    },

    // Optional link to leave request used for Leave status
    leaveRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'LeaveRequest', default: null },

    // Admin-level correction state (approved)
    correction: {
      type: {
        approved: { type: Boolean, default: false },
        before: { type: mongoose.Schema.Types.Mixed, default: {} },
        after: { type: mongoose.Schema.Types.Mixed, default: {} },
        approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        approvedAt: { type: Date, default: null },
        note: { type: String, default: '' },
      },
      default: {},
    },

    // Read-only source-of-truth fields
    // (used for auditing)
    markedByDevice: {
      type: Boolean,
      default: true,
    },

    // Store last processed punch ids/times for idempotency (optional)
    processedPunch: {
      punchInTime: { type: Date, default: null },
      punchOutTime: { type: Date, default: null },
    },

    audit: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

staffAttendanceSchema.index({ date: 1, staffId: 1 }, { unique: true });

module.exports = mongoose.model('StaffAttendance', staffAttendanceSchema);

