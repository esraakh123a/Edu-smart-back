const mongoose = require("mongoose");
const Enrollment = require("../models/Enrollments");
const Course = require("../models/Course");

// إنشاء تسجيل جديد
const createEnrollment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId, packageId } = req.body;

    if (!courseId && !packageId) {
      return res.status(400).json({ message: "courseId or packageId is required" });
    }

    // التحقق من التسجيل المكرر
    const existing = await Enrollment.findOne({ userId, $or: [{ courseId }, { packageId }] });
    if (existing) {
      return res.status(400).json({ message: "Already enrolled in this course/package" });
    }

    // إنشاء سجل جديد
    const enrollment = new Enrollment({ userId, courseId, packageId });
    await enrollment.save();

    // تسجيل المستخدم في كورس فردي
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

    // تسجيل المستخدم في باكج والكورسات داخلها
    if (packageId) {
      const pkg = await Course.findOne({ _id: packageId, type: "package" });
      if (!pkg) return res.status(404).json({ message: "Package not found" });

      // إضافة المستخدم إلى مصفوفة students في الباكج
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

    res.status(201).json({
      message: "Enrollment created successfully",
      enrollment
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// جلب كل التسجيلات للمستخدم
const getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ userId: req.user.id })
      .populate({
        path: "courseId",
        select: "title description type coverImageURL",
        match: { type: "course" }
      })
      .populate({
        path: "packageId",
        select: "title description type packages coverImageURL",
        match: { type: "package" }
      });

    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// تحديث التقدم progress
const updateProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId, progress } = req.body;

    const enrollment = await Enrollment.findOneAndUpdate(
      { userId, courseId },
      { progress },
      { new: true }
    );

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    res.json({ message: "Progress updated", enrollment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createEnrollment,
  getMyEnrollments,
  updateProgress
};
