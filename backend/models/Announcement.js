// Announcement Model (Enterprise)
const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    createdByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    audienceRole: { type: String, enum: ['student', 'staff', 'all'], default: 'all' },

    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },

    type: { type: String, enum: ['Meeting', 'Exam', 'Notice', 'Event'], default: 'Notice' },

    targetClassId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', default: null },
    targetSectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', default: null },

    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
  },
  { timestamps: true }
);

announcementSchema.index({ audienceRole: 1, createdAt: -1 });

module.exports = mongoose.model('Announcement', announcementSchema);

