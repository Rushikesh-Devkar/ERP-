const mongoose = require('mongoose');

const attendanceLogSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        'punch_in',
        'punch_out',
        'admin_student_mark',
        'admin_student_edit',
        'admin_student_correct',
        'admin_student_delete',
        'staff_correction_approved',
        'system',
      ],
      required: true,
      index: true,
    },

    // Device / staff punch ingestion
    device: {
      name: { type: String, default: '' },
    },

    employeeId: { type: String, default: '', index: true },
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', default: null },

    // Student attendance
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', default: null },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', default: null },
    sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', default: null },

    // Admin / teacher actor
    actorUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    actorRole: { type: String, default: '' },

    // Punch timestamps
    punchTime: { type: Date, default: null },

    // Raw payload for audit
    payload: { type: mongoose.Schema.Types.Mixed, default: {} },

    audit: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

attendanceLogSchema.index({ punchTime: -1 });

module.exports = mongoose.model('AttendanceLog', attendanceLogSchema);

