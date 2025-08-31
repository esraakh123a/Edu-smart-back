const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const auth = require('../middleware/auth');
// إنشاء كويز جديد
router.post('/', quizController.createQuiz);

// جلب جميع الكويزات
router.get('/',quizController.getAllQuizzes);

// router.get('/', quizController.getAllQuizzes); // باقي زي ما هو
// جلب كويز معين
router.get('/:id', quizController.getQuizById);

// تحديث كويز
router.put('/:id', quizController.updateQuiz);  

// حذف كويز
router.delete('/:id', quizController.deleteQuiz);

// إضافة سؤال إلى كويز
router.post('/:id/questions', quizController.addQuestionToQuiz);

// تحديث سؤال في كويز
router.put('/:id/questions/:questionIndex',  quizController.updateQuestionInQuiz);

// حذف سؤال من كويز
router.delete('/:id/questions/:questionIndex',  quizController.deleteQuestionFromQuiz);

module.exports = router;