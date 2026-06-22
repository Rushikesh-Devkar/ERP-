// Salary Components Model (Enterprise)
const mongoose = require('mongoose');

const salarySchema = new mongoose.Schema(
  {
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true, unique: true },

    basePay: { type: Number, required: true, min: 0 },

    allowances: [
      {
        name: { type: String, required: true, trim: true },
        amount: { type: Number, required: true, min: 0 },
      },
    ],

    deductions: [
      {
        name: { type: String, required: true, trim: true },
        amount: { type: Number, required: true, min: 0 },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Salary', salarySchema);

