// Fee Record per Student per Term/Month (Enterprise)
const mongoose = require('mongoose');

const feeRecordSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },

    // could be linked to Fee structure; keep flexible for now
    feeName: { type: String, default: 'Monthly Fees' },

    totalAmount: { type: Number, required: true, min: 0 },
    paidAmount: { type: Number, default: 0, min: 0 },

    dueDate: { type: Date, default: null },

    status: { type: String, enum: ['due', 'partially_paid', 'paid'], default: 'due' },

    term: { type: String, default: '' },
    month: { type: String, default: '' }, // YYYY-MM
  },
  { timestamps: true }
);

feeRecordSchema.index({ studentId: 1, month: 1 });

module.exports = mongoose.model('FeeRecord', feeRecordSchema);

