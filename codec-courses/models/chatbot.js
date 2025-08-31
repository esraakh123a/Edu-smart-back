const mongoose = require('mongoose');
const chatbotSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sessionId: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  sender: {
    type: String,
    enum: ['user', 'bot'],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  suggestedCourseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
  },
  suggestedPathId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Path',
  },
  lastContext: {
    type: String,
  }
});

module.exports = mongoose.model('ChatMessage', chatbotSchema);
