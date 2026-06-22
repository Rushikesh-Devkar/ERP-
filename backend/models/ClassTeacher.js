const mongoose = require('mongoose');

const classTeacherSchema = new mongoose.Schema(
  {
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section' }
  },
  { timestamps: true }
);

classTeacherSchema.index({ classId: 1, sectionId: 1 }, { unique: false });

module.exports = mongoose.model('ClassTeacher', classTeacherSchema);

