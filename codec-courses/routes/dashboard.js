const express = require('express');
const router = express.Router();

const { stats, recentActivities, getAllNotifications, markNotificationsRead,deleteNotification,clearAllNotifications,getPendingInstructors,approveInstructor,addNotification,pushNotification } = require('../controllers/dashboard');

router.get('/stats', stats);
router.get('/recent-activities', recentActivities);
router.get('/notifications', getAllNotifications);
router.post('/notifications/read', markNotificationsRead);
router.delete('/notifications/delete/:id', deleteNotification);
router.delete('/notifications/clear', clearAllNotifications);
router.get('/instructors/pending', getPendingInstructors);
router.post('/instructors/approve/:id', approveInstructor);
router.post('/notifications/add', addNotification);
router.post('/notifications/push', pushNotification);
module.exports = router;