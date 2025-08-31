const express = require('express');
const router = express.Router();
const {createLesson,getAllLessons,getLessonsByCourse,getLessonById,updateLesson,deleteLesson} = require('../controllers/lessonController');
const auth = require('../middleware/auth');
// إنشاء درس جديد
router.post('/', createLesson);

// جلب كل الدروس
router.get('/', getAllLessons);

// جلب كل دروس كورس معين
router.get('/course/:courseId', getLessonsByCourse);

// جلب درس واحد بالـ ID
router.get('/:id', getLessonById);

// تحديث درس بالـ ID
router.put('/:id', updateLesson);

// حذف درس بالـ ID
router.delete('/:id', deleteLesson);

module.exports = router;
