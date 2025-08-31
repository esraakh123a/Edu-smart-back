const User = require("../models/User");
const Course = require("../models/Course");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
require("dotenv").config();
// ===== جلب المدرسين الغير موافق عليهم =====
exports.getPendingInstructors = async (req, res) => {
  try {
    const instructors = await User.find({ role: "instructor", isApproved: false })
      .select("name email role certificateURL");
    res.status(200).json(instructors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.addUser = async (req, res) => {
  try {
    const { name, email, password, role , city ,phoneNumber } = req.body;

    if (!name || !email || !password || !role || !city || !phoneNumber) {
      return res.status(400).json({ message: "جميع الحقول مطلوبة" });
    }

    // التحقق إذا كان البريد موجود مسبقًا
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "البريد الإلكتروني موجود بالفعل" });
    }

    // // تشفير كلمة المرور
    // const hashedPassword = await bcrypt.hash(password, 10);

    // إنشاء المستخدم
    const newUser = new User({
      name,
      email,
      password,
      role,
      city,
      phonenumber:phoneNumber,
      isApproved: role === 'instructor' ? true : false, // Admin يتم الموافقة مباشرة
    });

    await newUser.save();

    res.status(201).json({ message: "تم إضافة المستخدم بنجاح" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "حدث خطأ أثناء إضافة المستخدم" });
  }
};

// search users 
exports.searchUsers = async (req, res) => {
  try {
    const search = req.query.search || "";

    // تقدر تبحث بالاسم أو الإيميل أو الموبايل
    const users = await User.find({
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } }
      ]
    });

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "حدث خطأ أثناء البحث عن المستخدمين" });
  }
};
// user Details
exports.userDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// ===== الموافقة على مدرس =====
exports.approveInstructor = async (req, res) => {
  try {
    const instructor = await User.findById(req.params.id).select("name email");
    if (!instructor) return res.status(404).json({ message: "Instructor not found" });

    // تحديث مباشر بدون validators
    await User.updateOne(
      { _id: req.params.id },
      { $set: { isApproved: true, status: "approved" } }
    );

    await sendEmail(instructor.email, instructor.name, "تمت الموافقة على حسابك كمدرس!");

    res.status(200).json({ message: "تمت الموافقة على المدرس" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===== رفض وحذف المدرس =====
exports.rejectInstructor = async (req, res) => {
  try {
    const instructor = await User.findById(req.params.id).select("name email");
    if (!instructor) return res.status(404).json({ message: "Instructor not found" });

    await sendEmail(instructor.email, instructor.name, "تم رفض حسابك كمدرس!");

    await User.deleteOne({ _id: req.params.id });

    res.status(200).json({ message: "تم رفض المدرس وحذف حسابه" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===== جلب الكورسات الغير موافق عليها =====
// ===== جلب الكورسات الغير موافق عليها للـ admin =====
exports.getPendingCourses = async (req, res) => {
  try {
    const courses = await Course.find({ isApproved: false, type: 'course' })
      .populate("instructorID", "name email")
      .populate("categoryID", "name");

    // لو مفيش كورسات، يرجع مصفوفة فارغة بدل رسالة
    res.status(200).json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// ===== الموافقة على كورس =====
exports.approveCourse = async (req, res) => {
  try {
    const courses = await Course.find({ isApproved: false, type: 'course' })
      .populate("instructorID", "name email")
      .populate("categoryID", "name");
    if (!courses) return res.status(404).json({ message: "Courses not found" });

    const course = courses.find(course => course._id.toString() === req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    await Course.updateOne(
      { _id: req.params.id },
      { $set: { isApproved: true } }
    );

    await sendEmail(course.instructorID.email, course.instructorID.name, `تمت الموافقة على كورسك: ${course.title}`);

    res.status(200).json({ message: `تمت الموافقة على الكورس: ${course.title}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
  // ===== جلب كل المستخدمين =====
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('name email role isApproved');
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate("instructorID", "name email")
      .populate("categoryID", "name");

    res.status(200).json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    await Course.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: "Course deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===== حذف مستخدم =====
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===== رفض وحذف كورس =====
exports.rejectCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate("instructorID", "name email");
    if (!course) return res.status(404).json({ message: "Course not found" });

    await sendEmail(course.instructorID.email, course.instructorID.name, `تم رفض كورسك: ${course.title}`);

    await Course.deleteOne({ _id: req.params.id });

    res.status(200).json({ message: "تم رفض الكورس وحذفه" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===== إرسال بريد إلكتروني =====
const transporter = nodemailer.createTransport({
  service: "gmail", // استخدم الخدمة مباشرة بدل host/port
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD, // App Password هنا
  },
});

const sendEmail = async (to, name, messageText) => {
  const info = await transporter.sendMail({
    from: `${process.env.FROM_NAME} <${process.env.GMAIL_USER}>`,
    to,
    subject: "إشعار Admin",
    html: `<p>مرحبا ${name},</p><p>${messageText}</p>`,
  });

  console.log("Message sent: %s", info.messageId);
};

