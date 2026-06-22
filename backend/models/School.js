const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    logoUrl: { type: String },
    academicYear: { type: String, required: true },
    schoolAddress: { type: String },
    contactEmail: { type: String },
    contactPhone: { type: String }
  },
  { timestamps: true }
);

// Single document pattern
schoolSchema.statics.getActive = async function () {
  const doc = await this.findOne().sort({ createdAt: -1 });
  return doc;
};

module.exports = mongoose.model('School', schoolSchema);

