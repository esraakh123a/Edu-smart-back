const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const auth = require('../middleware/auth');

router.post('/', auth, quizController.createQuiz);           // إنشاء كويز جديد
router.get('/', auth, quizController.getAllQuizzes);         // جلب كل الكويزات
router.get('/:id', auth, quizController.getQuizById);        // جلب كويز واحد
router.put('/:id', auth, quizController.updateQuiz);         // تحديث كويز
router.delete('/:id', auth, quizController.deleteQuiz);      // حذف كويز
router.get('/course/:courseId', auth, quizController.getQuizzesByCourse); // جلب كل الكويزات لكورس معين

module.exports = router;
