// Document Request Model (Enterprise)
const mongoose = require('mongoose');

const documentRequestSchema = new mongoose.Schema(
  {
    requestedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', default: null },

    documentType: {
      type: String,
      required: true,
      enum: ['Bonafide', 'Leaving', 'Character', 'IDCard', 'TC', 'Marks Card', 'Other'],
    },

    reason: { type: String, default: '' },

    status: {
      type: String,
      enum: ['pending_admin', 'approved', 'rejected', 'pending_generation', 'generated'],
      default: 'pending_admin',
    },

    adminDecision: {
      status: { type: String, enum: ['approved', 'rejected'], default: null },
      decidedByAdminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      decidedAt: { type: Date, default: null },
      note: { type: String, default: '' },
    },

    documentGenerated: {
      generatedById: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      generatedAt: { type: Date, default: null },
      fileUrl: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DocumentRequest', documentRequestSchema);


