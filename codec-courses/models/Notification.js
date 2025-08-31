const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  message: { type: String, required: true },    // نص الإشعار
  read: { type: Boolean, default: false },      // حالة القراءة
  createdAt: { type: Date, default: Date.now }  // وقت الإنشاء
});

module.exports = mongoose.model('Notification', notificationSchema);
