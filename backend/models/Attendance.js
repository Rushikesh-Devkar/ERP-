// Attendance Model (Enterprise)
const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },

    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },

    // Attendance can be class-level or subject-level.
    // Keep subjectId optional so you can support both patterns.
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', default: null },

    markedByStaffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },

    entries: [
      {
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
        status: {
          type: String,
          enum: ['Present', 'Absent', 'Leave'],
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

// Logical uniqueness per school day/class/section/subject
attendanceSchema.index(
  { date: 1, classId: 1, sectionId: 1, subjectId: 1 },
  { unique: true, sparse: true }
);

module.exports = mongoose.model('Attendance', attendanceSchema);



