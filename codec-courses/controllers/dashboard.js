const User = require('../models/User');
const Course = require('../models/Course');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');

// ====== Notification Helper ======
const pushNotification = async (event, payload) => {
  let message = "";
  let type = event;

  switch (event) {
    case "user_registered":
      message = `تم تسجيل مستخدم جديد: ${payload.name}`;
      break;

    case "instructor_pending":
      message = `مدرب جديد بانتظار الموافقة: ${payload.name}`;
      break;

    case "instructor_approved":
      message = `تمت الموافقة على المدرب: ${payload.name}`;
      break;

    case "course_pending":
      message = `دورة جديدة بانتظار المراجعة: ${payload.title}`;
      break;

    case "course_approved":
      message = `تمت الموافقة على الدورة: ${payload.title}`;
      break;

    default:
      message = "حدث غير معروف";
  }

  if (message) {
    await Notification.create({ type, message, read: false });
  }
};

// ===== Stats
const stats = async (req, res) => {
  try {
    const usersCount = await User.countDocuments({ role: 'student' });
    const pendingInstructorsCount = await User.countDocuments({ isApproved: false, role: 'instructor' });
    const instructorsCount = await User.countDocuments({ role: 'instructor' });
    const coursesCount = await Course.countDocuments();
    const pendingCoursesCount = await Course.countDocuments({ status: 'pending' });
    const totalSales = await Payment.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    res.json({
      users: usersCount,
      pendingInstructors: pendingInstructorsCount,
      instructors: instructorsCount,
      courses: coursesCount,
      pendingCourses: pendingCoursesCount,
      totalSales: totalSales[0] ? totalSales[0].total : 0
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching stats', error: err.message });
  }
};

// ===== Recent Activities
const recentActivities = async (req, res) => {
  try {
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5);
    const recentCourses = await Course.find().sort({ createdAt: -1 }).limit(5);

    const activities = [];

    recentUsers.forEach(u => {
      activities.push({ message: `تم تسجيل مستخدم جديد: ${u.name}`, time: u.createdAt });
    });

    recentCourses.forEach(c => {
      activities.push({ message: `تم إنشاء دورة جديدة: ${c.title}`, time: c.createdAt });
    });

    activities.sort((a, b) => new Date(b.time) - new Date(a.time));

    res.json(activities);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching recent activities', error: err.message });
  }
};

// ===== Notifications
const getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ 
      message: "Error fetching notifications", 
      error: err.message 
    });
  }
};

const addNotification = async (req, res) => {
  try {
    const { type, message } = req.body;
    const notification = await Notification.create({ type, message, read: false });
    res.json(notification);
  } catch (err) {
    res.status(500).json({ 
      message: "Error adding notification", 
      error: err.message 
    });
  }
};

const markNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany({ read: false }, { $set: { read: true } });
    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ 
      message: "Error marking notifications as read", 
      error: err.message 
    });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndDelete(id);
    res.json({ message: "Notification deleted successfully" });
  } catch (err) {
    res.status(500).json({ 
      message: "Error deleting notification", 
      error: err.message 
    });
  }
};

const clearAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({});
    res.json({ message: "All notifications cleared successfully" });
  } catch (err) {
    res.status(500).json({ 
      message: "Error clearing notifications", 
      error: err.message 
    });
  }
};

// ===== Instructors
const getPendingInstructors = async (req, res) => {
  try {
    const pendingInstructors = await User.find({
      role: 'instructor',
      isApproved: false
    }).sort({ createdAt: -1 });

    res.json({ pendingInstructors, count: pendingInstructors.length });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching pending instructors', error: err.message });
  }
};

const approveInstructor = async (req, res) => {
  try {
    const instructor = await User.findById(req.params.id);
    if (!instructor || instructor.role !== 'instructor') 
      return res.status(404).json({ message: 'Instructor not found' });

    instructor.isApproved = true;
    instructor.approvalDate = new Date();
    await instructor.save();

    // إشعار موحد
    await pushNotification("instructor_approved", { name: instructor.name });

    res.json({ message: 'Instructor approved', instructor });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { 
  stats, 
  recentActivities, 
  getAllNotifications, 
  markNotificationsRead, 
  deleteNotification, 
  clearAllNotifications, 
  getPendingInstructors, 
  approveInstructor, 
  addNotification,
  pushNotification   // هنصدرها لو محتاج تستخدمها فى أماكن تانية
};
