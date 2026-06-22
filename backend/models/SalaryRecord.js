// Salary Processing Record (Enterprise)
const mongoose = require('mongoose');

const salaryRecordSchema = new mongoose.Schema(
  {
    salaryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Salary', required: true },

    month: { type: String, required: true }, // YYYY-MM

    gross: { type: Number, default: 0 },
    totalAllowances: { type: Number, default: 0 },
    totalDeductions: { type: Number, default: 0 },
    netSalary: { type: Number, default: 0 },

    processedByAdminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['processed', 'paid'], default: 'processed' },

    slipUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

salaryRecordSchema.index({ salaryId: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('SalaryRecord', salaryRecordSchema);

