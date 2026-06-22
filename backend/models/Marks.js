// Marks Model (Enterprise)
const mongoose = require('mongoose');

const marksSchema = new mongoose.Schema(
  {
    examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },

    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },

    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },

    markedByStaffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },

    entries: [
      {
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
        marks: { type: Number, min: 0, max: 100, required: true },
        status: { type: String, enum: ['submitted', 'locked'], default: 'submitted' },
      },
    ],
  },
  { timestamps: true }
);

marksSchema.index(
  { examId: 1, classId: 1, sectionId: 1, subjectId: 1, markedByStaffId: 1 },
  { unique: false }
);

module.exports = mongoose.model('Marks', marksSchema);


