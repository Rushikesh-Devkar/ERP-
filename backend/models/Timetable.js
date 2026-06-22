// Timetable Model (Enterprise)
const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema(
  {
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },

    dayOfWeek: {
      type: String,
      enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      required: true,
    },

    periods: [
      {
        startTime: { type: String, required: true }, // store as HH:mm for simplicity
        endTime: { type: String, required: true },
        subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
        assignedTeacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', default: null },
        roomNumber: { type: String, default: '' },
      },
    ],
  },
  { timestamps: true }
);

timetableSchema.index({ classId: 1, sectionId: 1, dayOfWeek: 1 }, { unique: true });

module.exports = mongoose.model('Timetable', timetableSchema);

