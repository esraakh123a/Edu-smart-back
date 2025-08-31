const Lesson = require('../models/Lesson');
const Course = require('../models/Course');

// 1. إنشاء درس جديد
const createLesson = async (req, res) => {
    try {
        const { courseID } = req.body;
        const course = await Course.findById(courseID);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (course.type !== 'course') {
            return res.status(400).json({ message: 'Lesson cannot be added to a package course' });
        }

        const newLesson = new Lesson(req.body);
        const savedLesson = await newLesson.save();
        res.status(201).json(savedLesson);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// 2. جلب كل الدروس أو فلترة بدروس كورس معين
const getAllLessons = async (req, res) => {
    try {
        const { courseId } = req.query;
        let query = {};

        if (courseId) {
            query.courseID = courseId; 
        }
        const lessons = await Lesson.find(query).populate('courseID', 'title');
        res.status(200).json(lessons);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. جلب درس واحد عن طريق الـ ID
const getLessonById = async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id).populate('courseID', 'title');
        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }
        res.status(200).json(lesson);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 4. تحديث بيانات درس
const updateLesson = async (req, res) => {
    try {
        // تحقق لو courseID اتغير
        if (req.body.courseID) {
            const newCourse = await Course.findById(req.body.courseID);
            if (!newCourse) {
                return res.status(404).json({ message: 'Course not found' });
            }
            if (newCourse.type !== 'course') {
                return res.status(400).json({ message: 'Lesson cannot be added to a package course' });
            }
        }

        const updatedLesson = await Lesson.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedLesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }
        res.status(200).json(updatedLesson);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// 5. حذف درس
const deleteLesson = async (req, res) => {
    try {
        const deletedLesson = await Lesson.findByIdAndDelete(req.params.id);
        if (!deletedLesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }
        res.status(200).json({ message: 'Lesson deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 6. جلب كل الدروس الخاصة بكورس معين
const getLessonsByCourse = async (req, res) => {
    try {
        const { courseId } = req.params; 
        const lessons = await Lesson.find({ courseID: courseId }).populate('courseID', 'title description');
        if (lessons.length === 0) {
            return res.status(404).json({ message: 'Lessons not found for this course or course not found' });
        }
        res.status(200).json(lessons);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createLesson,
    getAllLessons,
    getLessonById,
    updateLesson,
    deleteLesson,
    getLessonsByCourse
};
