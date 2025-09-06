const Quiz = require('../models/Quiz');
const Course = require('../models/Course');

// إضافة كويز جديد
exports.createQuiz = async (req, res) => {
  try {
    const { title, category, relatedCourse, timeLimit, passPercentage, questions } = req.body;

    // التأكد أن الكورس موجود
    const course = await Course.findById(relatedCourse);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const newQuiz = new Quiz({
      title,
      category,
      relatedCourse,
      timeLimit,
      passPercentage,
      questions,
      createdBy: req.user?.id || null
    });

    const savedQuiz = await newQuiz.save();
    res.status(201).json(savedQuiz);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// جلب كل الكويزات
exports.getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find().populate('relatedCourse', 'title').populate('createdBy', 'name');
    res.status(200).json(quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// جلب كويز معين
exports.getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('relatedCourse', 'title')
      .populate('createdBy', 'name');
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    res.status(200).json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// تحديث كويز
exports.updateQuiz = async (req, res) => {
  try {
    const updatedQuiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedQuiz) return res.status(404).json({ message: 'Quiz not found' });
    res.status(200).json(updatedQuiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// حذف كويز
exports.deleteQuiz = async (req, res) => {
  try {
    const deletedQuiz = await Quiz.findByIdAndDelete(req.params.id);
    if (!deletedQuiz) return res.status(404).json({ message: 'Quiz not found' });
    res.status(200).json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// جلب كل الكويزات الخاصة بكورس معين
exports.getQuizzesByCourse = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ relatedCourse: req.params.courseId });
    res.status(200).json(quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
