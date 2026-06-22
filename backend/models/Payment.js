// Payment Model (Enterprise)
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    feeRecordId: { type: mongoose.Schema.Types.ObjectId, ref: 'FeeRecord', required: true },

    paidByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    amount: { type: Number, required: true, min: 1 },

    paymentMethod: { type: String, enum: ['Cash', 'UPI', 'BankTransfer', 'Card', 'Other'], default: 'Cash' },

    receiptNo: { type: String, default: '' },
    paidAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);

