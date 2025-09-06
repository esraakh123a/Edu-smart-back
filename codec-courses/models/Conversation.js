const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // هنقدر نعمل populate ونجيب بيانات الطرفين
        required: true
      }
    ],
    lastMessage: {
      type: String,
      default: ''
    },
    lastMessageSender: {  // مين اللي كتب آخر رسالة
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    isGroup: { // علشان تدعم محادثة جروب لو حبيت توسع
      type: Boolean,
      default: false
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true } // بيضيف createdAt و updatedAt أوتوماتيك
);

// عشان الترتيب يفضل سهل عند عرض الـ inbox
conversationSchema.index({ updatedAt: -1 });

module.exports = mongoose.model('Conversation', conversationSchema);
