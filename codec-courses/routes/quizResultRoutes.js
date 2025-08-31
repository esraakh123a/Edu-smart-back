const express = require('express');
const router = express.Router();
const quizResultController = require('../controllers/quizResultController');
const auth = require('../middleware/auth');
// تسجيل نتيجة كويز
router.post('/',  quizResultController.submitQuizResult);

// جلب نتايج كويز معين
router.get('/quiz/:quizId',  quizResultController.getQuizResults);

// جلب نتيجة طالب معين لكويز معين
router.get('/quiz/:quizId/student/:studentId', quizResultController.getStudentQuizResult);

module.exports = router;