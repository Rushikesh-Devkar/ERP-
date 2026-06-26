const mongoose = require('mongoose');

const studentAttendanceEntrySchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    status: {
      type: String,
      enum: [
        'Present',
        'Absent',
        'Late',
        'Half Day',
        'Medical Leave',
        'Approved Leave',
        'Holiday',
      ],
      required: true,
      index: true,
    },

    // Optional additional details
    attendanceTime: { type: Date, default: null },
    markedByTeacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: false },
  },
  { _id: false }
);

const studentAttendanceSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true, index: true },

    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true, index: true },
    sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true, index: true },

    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', default: null },

    markedByStaffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: false },

    entries: { type: [studentAttendanceEntrySchema], default: [] },

    audit: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

studentAttendanceSchema.index({ date: 1, classId: 1, sectionId: 1, subjectId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('StudentAttendance', studentAttendanceSchema);

