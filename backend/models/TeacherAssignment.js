const mongoose = require('mongoose');

// Maps subject -> staff(teacher) and (optional) class/section scope
const teacherAssignmentSchema = new mongoose.Schema(
  {
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
    sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section' }
  },
  { timestamps: true }
);

teacherAssignmentSchema.index(
  { staffId: 1, subjectId: 1, classId: 1, sectionId: 1 },
  { unique: true }
);

module.exports = mongoose.model('TeacherAssignment', teacherAssignmentSchema);

