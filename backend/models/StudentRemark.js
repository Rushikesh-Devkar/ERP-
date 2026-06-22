// StudentRemark Model (Enterprise)
const mongoose = require('mongoose');

const studentRemarkSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    createdByStaffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },

    category: { type: String, enum: ['Academic', 'Attendance', 'Behavior'], required: true },
    text: { type: String, required: true, trim: true },
    visibility: { type: String, enum: ['Parent', 'Student', 'Both'], default: 'Parent' },
  },
  { timestamps: true }
);

studentRemarkSchema.index({ studentId: 1, createdByStaffId: 1, category: 1 });

module.exports = mongoose.model('StudentRemark', studentRemarkSchema);

