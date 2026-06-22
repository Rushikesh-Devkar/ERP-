const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema(
  {
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    name: { type: String, required: true, trim: true },
    sortOrder: { type: Number, default: 0 }
  },
  { timestamps: true }
);

sectionSchema.index({ classId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Section', sectionSchema);

