// conversation model
const mongoose = require('mongoose');
const conversationSchema = new mongoose.Schema({
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // علشان تقدر تجيب بيانات الطالب والمدرب بسهولة
      required: true
    }
  ],
  lastMessage: {
    type: String,
    default: ''
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Conversation', conversationSchema);
