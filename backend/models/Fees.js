// Fees Model
const mongoose = require('mongoose');

const feesSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    unique: true
  },
  totalFees: {
    type: Number,
    required: true
  },
  paidFees: {
    type: Number,
    default: 0
  },
  dueFees: {
    type: Number,
    default: function() {
      return this.totalFees - this.paidFees;
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Fees', feesSchema);

