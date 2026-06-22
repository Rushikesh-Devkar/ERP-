// Leave Request Model (Enterprise)
const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema(
  {
    requestedByRole: { type: String, enum: ['student', 'staff'], required: true },

    // Student flow
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', default: null },
    teacherStaffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', default: null },

    // Staff flow
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', default: null },

    // Common
    requestedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    reason: { type: String, required: true },
    leaveType: { type: String, enum: ['Casual', 'Medical', 'Sick', 'Other'], default: 'Casual' },

    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },

    status: {
      type: String,
      enum: [
        'pending_teacher',
        'teacher_approved_pending_principal',
        'teacher_rejected',
        'pending_principal',
        'approved',
        'rejected',
      ],
      default: 'pending_teacher',
    },

    teacherDecision: {
      status: { type: String, enum: ['approved', 'rejected', 'forwarded_principal'], default: null },
      decidedByStaffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', default: null },
      decidedAt: { type: Date, default: null },
      note: { type: String, default: '' },
    },

    principalDecision: {
      status: { type: String, enum: ['approved', 'rejected'], default: null },
      decidedByPrincipalId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      decidedAt: { type: Date, default: null },
      note: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);


