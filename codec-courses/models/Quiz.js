// ****تم اضافته 
// category: مطلوب، مع قائمة محتملة (تقدري تعدليها).
// timeLimit: بالدقائق، مطلوب.
// passPercentage: نسبة النجاح، مطلوب.

const mongoose = require('mongoose');
const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },

 category: {
  type: String,
  required: true,
  default: 'Programming', // default category
  enum: ['Programming', 'Mathematics', 'Artificial Intelligence', 'Technology', 'Design'] 
},
  relatedCourse: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Course',
  required: true
},

  timeLimit: {// بالدقائق 
    type: Number,
    required: true,
    default: 30, // وقت افتراضي بالدقائق
    min: 1 // أقل وقت 1 دقيقة
  },
  passPercentage: {//نسبة النجاح 
    type: Number,
    required: true,
    default: 60, // نسبة النجاح الافتراضية %
    min: 0,
    max: 100
  },
  questions: [{
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
          return arr.length >= 2; // خيارين على الأقل
        },
        message: 'يجب أن يحتوي السؤال على خيارين على الأقل'
      }
    },
    correctAnswer: {// مهم
      type: String,
      required: true,
      validate: {
        validator: function(value) {
          return this.options.includes(value); // الإجابة من ضمن الخيارات
        },
        message: 'الإجابة الصحيحة يجب أن تكون من بين الخيارات'
      }
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Quiz', quizSchema);