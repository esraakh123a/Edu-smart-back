
//percentage: النسبة المئوية للدرجة.
// passed: Boolean (true لو نجح، false لو رسب).

const mongoose = require('mongoose');

const quizResultSchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  answers: [{
    questionIndex: {
      type: Number,
      required: true
    },
    selectedAnswer: {
      type: String,
      required: true
    }
  }],
  score: {
    type: Number,
    required: true
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  percentage: {////percentage: النسبة المئوية للدرجة.
    type: Number,
    required: true // النسبة المئوية (مثل 75%)
  },
  passed: {///////// passed: Boolean (true لو نجح، false لو رسب).
    type: Boolean,
    required: true // نجح أو رسب
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('QuizResult', quizResultSchema);