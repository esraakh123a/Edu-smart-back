const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const courseController = require('../controllers/courseController'); // استيراد متحكم الكورسات
const { countDocuments } = require('../models/User');
const Course = require('../models/Course');

// تعريف مسارات الكورسات
router.post('/create', courseController.createCourse);  
router.get('/get-package/:id', courseController.getPackageById); 
router.get('/get-all-packages', courseController.getallpackages);              // GET /api/courses -> لجلب كل الكورسات
router.get('/all', courseController.getAllCourses);                         // GET /api/courses -> لجلب كل الكورسات
router.get('/get/:id', courseController.getCourseById);          // GET /api/courses/:id -> لجلب كورس واحد بالـ ID
router.put('/update/:id', courseController.updateCourse);           // PUT /api/courses/:id -> لتحديث كورس بالـ ID
router.delete('/delete/:id', courseController.deleteCourse);        // DELETE /api/courses/:id -> لحذف كورس بالـ ID
router.post('/fix-course-prices', courseController.fixCoursePrices); // تحديث أسعار الكورسات الفردية

module.exports = router; 