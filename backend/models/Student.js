// Student Model - Extends User model
const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  class: {
    type: String,
    required: true
  },
  rollNo: {
    type: String,
    required: true,
    unique: true
  },
  parentName: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});


module.exports = mongoose.model('Student', studentSchema);


