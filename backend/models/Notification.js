// Notification Model (Enterprise)
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    type: {
      type: String,
      enum: [
        'leave_approved',
        'leave_rejected',
        'document_approved',
        'document_rejected',
        'new_announcement',
        'attendance_alert',
        'fee_due_reminder',
      ],
      required: true,
    },

    entityRef: {
      type: { type: String, required: true },
      id: { type: mongoose.Schema.Types.ObjectId, required: true },
    },

    message: { type: String, required: true },
    status: { type: String, enum: ['unread', 'read'], default: 'unread' },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);

