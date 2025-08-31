const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin');
// Get pending instructors
router.get("/pending-instructors", adminController.getPendingInstructors);

// Approve / Reject instructor
router.post("/instructors/approve/:id", adminController.approveInstructor);
router.post("/instructors/reject/:id", adminController.rejectInstructor);

// Get pending courses
router.get("/pending-courses", adminController.getPendingCourses);

// Approve / Reject course
router.post("/courses/approve/:id", adminController.approveCourse);
router.post("/courses/reject/:id", adminController.rejectCourse);

// Add user
router.post("/add-user", adminController.addUser);
// Get all users
router.get("/users", adminController.getAllUsers);
// Get user details
router.get("/users/:id", adminController.userDetails);
// Search users
router.get("/search-users", adminController.searchUsers);
// Delete user
router.delete("/users/:id", adminController.deleteUser);
// Get all courses
router.get("/courses", adminController.getAllCourses);
// Delete course
router.delete("/courses/:id", adminController.deleteCourse);
module.exports = router;
