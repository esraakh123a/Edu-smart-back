const Joi = require('joi');
const QuizResult = require('../models/QuizResult');
const Quiz = require('../models/Quiz');

// تسجيل نتيجة كويز
const quizResultSchema = Joi.object({
  quizId: Joi.string().required(),
  answers: Joi.array().items(
    Joi.object({
      questionIndex: Joi.number().required(),
      selectedAnswer: Joi.string().required()
    })
  ).required()
});
exports.submitQuizResult = async (req, res) => {
  try {
    // التحقق من صحة البيانات باستخدام Joi
    const { error } = quizResultSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ 
        message: 'Invalid data', // خطأ في البيانات
        errors: error.details.map(err => err.message) // عرض تفاصيل الأخطاء
      });
    }

    const { quizId, answers } = req.body; // استخراج ID الكويز والإجابات من الطلب

    // البحث عن الكويز في قاعدة البيانات
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' }); // الكويز غير موجود
    }

    // التحقق إن الكويز فيه أسئلة
    if (quiz.questions.length === 0) {
      return res.status(404).json({ message: 'No questions for this quiz' }); // لا توجد أسئلة
    }

    // حساب الدرجة
    let score = 0;
    for (const answer of answers) {
      // البحث عن السؤال حسب ترتيب السؤال في answers
      const question = quiz.questions[answer.questionIndex];
      // لو الإجابة صحيحة، نزود الدرجة
      if (question && question.correctAnswer === answer.selectedAnswer) {
        score += 1;
      }
    }

    // حساب النسبة المئوية
    const percentage = (score / quiz.questions.length) * 100;
    // تحديد النجاح أو الرسوب بناءً على نسبة النجاح المطلوبة
    const passed = percentage >= quiz.passPercentage;

    // إنشاء سجل جديد لنتيجة الكويز
    const quizResult = new QuizResult({
      quizId,
      studentId: req.user ? req.user._id : null, // لو فيه مستخدم مسجل، نحفظ ID بتاعه
      answers,
      score,
      totalQuestions: quiz.questions.length,
      percentage, // إضافة النسبة
      passed // إضافة النجاح أو الرسوب
    });

    // حفظ النتيجة في قاعدة البيانات
    await quizResult.save();

    // إرسال رد نجاح
    res.status(201).json({ 
      message: 'Quiz result submitted successfully', // تم تسجيل النتيجة بنجاح
      quizResult 
    });

  } catch (error) {
    // في حالة حدوث خطأ أثناء العملية
    res.status(400).json({ 
      message: 'Error while submitting quiz result', // خطأ أثناء تسجيل النتيجة
      error: error.message 
    });
  }
};

// جلب كل نتائج كويز معين
exports.getQuizResults = async (req, res) => {
  try {
    const { quizId } = req.params;
    const results = await QuizResult.find({ quizId });
    res.status(200).json({ results });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching quiz results', error: error.message });
  }
};

// جلب نتيجة طالب معين لكويز معين
exports.getStudentQuizResult = async (req, res) => {
  try {
    const { quizId, studentId } = req.params;
    const result = await QuizResult.findOne({ quizId, studentId });
    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }
    res.status(200).json({ result });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching student quiz result', error: error.message });
  }
};