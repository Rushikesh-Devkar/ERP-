// Exam Model (Enterprise)
const mongoose = require('mongoose');

const examSchema = new mongoose.Schema(
  {
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },

    name: { type: String, required: true, trim: true },
    examDate: { type: Date, required: true },
    maxMarks: { type: Number, default: 100, min: 1 },
  },
  { timestamps: true }
);

examSchema.index({ classId: 1, sectionId: 1, subjectId: 1, examDate: 1 }, { unique: false });

module.exports = mongoose.model('Exam', examSchema);

