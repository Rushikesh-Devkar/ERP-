// Optional helper model for async report export jobs (Enterprise)
const mongoose = require('mongoose');

const reportsExportSchema = new mongoose.Schema(
  {
    requestedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    reportType: {
      type: String,
      enum: ['attendance', 'marks', 'students_performance', 'class_performance', 'fee_report', 'salary_report'],
      required: true,
    },

    format: { type: String, enum: ['PDF', 'CSV', 'Excel'], required: true },

    params: { type: Object, default: {} },

    status: { type: String, enum: ['queued', 'processing', 'ready', 'failed'], default: 'queued' },

    fileUrl: { type: String, default: '' },
    error: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ReportsExport', reportsExportSchema);

