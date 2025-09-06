const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: function(arr) {
        return arr.length >= 2; // على الأقل خيارين
      },
      message: 'يجب أن يحتوي السؤال على خيارين على الأقل'
    }
  },
  correctAnswer: {
    type: String,
    required: true,
    validate: {
      validator: function(value) {
        return this.options.includes(value);
      },
      message: 'الإجابة الصحيحة يجب أن تكون من بين الخيارات'
    }
  }
});

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Programming', 'Mathematics', 'Artificial Intelligence', 'Technology', 'Design'],
    default: 'Programming'
  },
  relatedCourse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  timeLimit: { // بالدقائق
    type: Number,
    required: true,
    default: 30,
    min: 1
  },
  passPercentage: {
    type: Number,
    required: true,
    default: 60,
    min: 0,
    max: 100
  },
  questions: [questionSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, { timestamps: true }); // يحفظ createdAt و updatedAt تلقائيًا

module.exports = mongoose.model('Quiz', quizSchema);
