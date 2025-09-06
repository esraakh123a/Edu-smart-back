const express = require("express");
const router = express.Router();
const { createEnrollment, getMyEnrollments, updateProgress,completeLesson } = require("../controllers/Enrollment");
const auth = require("../middleware/auth");
// Create enrollment (اشترك في كورس)
router.post("/", auth, createEnrollment);

// Get all my enrollments
router.get("/", auth, getMyEnrollments);

// Update my progress in a course
router.put("/progress", auth, updateProgress);

router.put("/complete-lesson", auth, completeLesson);

module.exports = router;