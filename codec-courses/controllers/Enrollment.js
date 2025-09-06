const mongoose = require("mongoose");
const Enrollment = require("../models/Enrollments");
const Course = require("../models/Course");

// إنشاء تسجيل جديد (Course أو Package)
const createEnrollment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId, packageId } = req.body;

    if (!courseId && !packageId) {
      return res.status(400).json({ message: "courseId or packageId is required" });
    }

    const existing = await Enrollment.findOne({ userId, $or: [{ courseId }, { packageId }] });
    if (existing) return res.status(400).json({ message: "Already enrolled in this course/package" });

    const enrollment = new Enrollment({ userId, courseId, packageId, completedLessons: [], progress: 0 });
    await enrollment.save();

    // تسجيل المستخدم في الكورس الفردي
    if (courseId) {
      const course = await Course.findById(courseId);
      if (course) {
        course.students = course.students || [];
        if (!course.students.includes(userId)) {
          course.students.push(userId);
          await course.save();
        }
      }
    }

    // تسجيل المستخدم في الباكج والكورسات داخلها
    if (packageId) {
      const pkg = await Course.findOne({ _id: packageId, type: "package" });
      if (!pkg) return res.status(404).json({ message: "Package not found" });

      pkg.students = pkg.students || [];
      if (!pkg.students.includes(userId)) {
        pkg.students.push(userId);
        await pkg.save();
      }

      // إضافة المستخدم لكل الكورسات داخل الباكج
      if (pkg.package?.length) {
        for (const cId of pkg.package) {
          const course = await Course.findById(cId);
          if (course) {
            course.students = course.students || [];
            if (!course.students.includes(userId)) {
              course.students.push(userId);
              await course.save();
            }
          }
        }
      }
    }

    res.status(201).json({ message: "Enrollment created successfully", enrollment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// جلب كل التسجيلات للمستخدم مع populated courses/packages
const getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ userId: req.user.id })
      .populate({
        path: "courseId",
        select: "title description type coverImageURL lessons ",
        populate: { path: "instructorID", select: "_id" }
      })

      .populate({
        path: "packageId",
        select: "title description type coverImageURL package",

      });

    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// تحديث progress لكورس معين
const updateProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId, progress } = req.body;

    const enrollment = await Enrollment.findOneAndUpdate(
      { userId, courseId },
      { progress },
      { new: true }
    );

    if (!enrollment) return res.status(404).json({ message: "Enrollment not found" });

    res.json({ message: "Progress updated", enrollment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// تعليم درس كمكتمل وتحديث progress تلقائيًا
const completeLesson = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId, lessonId } = req.body;

    const enrollment = await Enrollment.findOne({ userId, courseId });
    if (!enrollment) return res.status(404).json({ message: "Enrollment not found" });

    enrollment.completedLessons = enrollment.completedLessons || [];
    const alreadyCompleted = enrollment.completedLessons.some(
      l => l.lessonId.toString() === lessonId
    );

    if (!alreadyCompleted) {
      enrollment.completedLessons.push({ lessonId, completedAt: new Date() });
    }

    const course = await Course.findById(courseId);
    const totalLessons = course?.lessons?.length || 0;
    const completedCount = enrollment.completedLessons.length;

    enrollment.progress = totalLessons > 0
      ? Math.round((completedCount / totalLessons) * 100)
      : 0;

    await enrollment.save();

    res.json({
      message: "Lesson marked as completed",
      progress: enrollment.progress,
      completedLessons: enrollment.completedLessons,
      totalLessons
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createEnrollment,
  getMyEnrollments,
  updateProgress,
  completeLesson
};
