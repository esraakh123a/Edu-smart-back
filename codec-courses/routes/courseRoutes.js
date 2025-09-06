const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const courseController = require('../controllers/courseController'); // استيراد متحكم الكورسات
const { countDocuments } = require('../models/User');
const upload = require("../controllers/cloudinary");
const Course = require('../models/Course');

// تعريف مسارات الكورسات
router.post('/create', auth, upload.single("coverImage"), courseController.createCourse);  
router.get('/get-package/:id', courseController.getPackageById); 
router.get('/get-all-packages', courseController.getallpackages);              // GET /api/courses -> لجلب كل الكورسات
router.get('/all', courseController.getAllCourses);                         // GET /api/courses -> لجلب كل الكورسات
router.get('/get/:id', courseController.getCourseById);          // GET /api/courses/:id -> لجلب كورس واحد بالـ ID
router.get('/my-courses', auth, courseController.getMyCourses); // GET /api/courses/my-courses -> لجلب كورسات المدرب
router.put('/update/:id', auth, courseController.updateCourse);           // PUT /api/courses/:id -> لتحديث كورس بالـ ID
router.delete('/delete/:id', auth, courseController.deleteCourse);        // DELETE /api/courses/:id -> لحذف كورس بالـ ID
router.post('/fix-course-prices', courseController.fixCoursePrices); // تحديث أسعار الكورسات الفردية

module.exports = router; 