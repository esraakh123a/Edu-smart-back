const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require('nodemailer');
const usermodele = require("../models/User");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendemai")
require('dotenv').config()
const generateToken = require("../utils/jwt_utils")




//getuserس
var getusers = async (req, res) => {
  try {
    var users = await usermodele.find();
    res.status(200).send(users)
  } catch (err) {
    res.status(500).send({ message: "some thing is wrong" });
  }

}

//register
const createUser = async (req, res) => {
  try {
    const { name, email, password, phonenumber, city, role } = req.body;

    // التأكد من عدم وجود الإيميل مسبقًا
    const existingUser = await usermodele.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const newUserData = { name, email, password, phonenumber, city, role };

    // إذا المستخدم مدرس، اجعل isApproved = false وأضف رابط الشهادة
    if (role === "instructor") {
      newUserData.isApproved = false;
      newUserData.certificateURL = req.file ? req.file.path : null; // استخدم Multer لرفع الملف
    }

    const newUser = new usermodele(newUserData);
    await newUser.save();

    // حذف كلمة المرور من الريسبونس
    const { password: _, ...userData } = newUser.toObject();

    res.status(201).json({ 
      message: "User created successfully", 
      user: userData,
      isApproved: newUserData.isApproved || false  // لو مدرس هيكون false تلقائي
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// login
var login_user = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Please enter email and password" });
  }

  const user = await usermodele.findOne({ email: email });
  if (!user) return res.status(404).json({ message: "User does not exist" });

  // تحقق من كلمة المرور
  const isvalid = await bcrypt.compare(password, user.password);
  if (!isvalid) return res.status(401).json({ message: "Password is wrong" });

  // إذا المستخدم مدرس ولم تتم الموافقة
  if (user.role === "instructor" && !user.isApproved) {
    return res.status(200).json({
      message: "account not approved by Admin",
      isApproved: false,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  }

  // إذا كل شيء تمام
  const token = generateToken(user);
  res.status(200).json({
    message: "login successfully",
    token,
    isApproved: user.isApproved,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
};




//عشان يبعت لى واحد بس اللى يخصه التوكن اللى بعته فى الهيدر مش يجت كلهم 

const getProfile = async (req, res) => {
  const user = await usermodele.findById(req.user.id).select("-password");
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.json(user);
};


//update
const updateUser = async (req, res) => {
  try {
    const userId = req.user.id; // جاي من التوكن

    // الحاجات اللي عايز تعدلها
    const { name, city, phonenumber,password } = req.body;

    const updatedUser = await usermodele.findByIdAndUpdate(
      userId,
      { name, city, phonenumber,password },
      { new: true, runValidators: true } // new: يرجع النسخة الجديدة بعد التعديل
    ).select("-password");  //-password معناها استبعدلى ده من ظهوره فى البيانات 

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User updated successfully",
      user: updatedUser
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user preferences (language, darkMode, notifications)
const updatePreferences = async (req, res) => {
  try {
    const userId = req.user.id; // جاي من التوكن

    // القيم اللي ممكن تتعدل
    const { language, darkMode, notifications } = req.body;

    // تعديل Nested Object في Mongoose
    const updatedUser = await usermodele.findByIdAndUpdate(
      userId,
      {
        "preferences.language": language,
        "preferences.darkMode": darkMode,
        "preferences.notifications": notifications
      },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Preferences updated successfully",
      preferences: updatedUser.preferences
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// 📌 طلب إعادة تعيين كلمة المرور
const forgotPassword = async (req, res) => {
  try {
    const user = await usermodele.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }

    // إنشاء OTP عشوائي 6 أرقام
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // تخزين OTP وصلاحية 10 دقائق
    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpires = Date.now() + 10 * 60 * 1000; // 10 دقائق

    await user.save({ validateBeforeSave: false });

    // إعداد nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // إرسال OTP بالإيميل
    await transporter.sendMail({
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: user.email,
      subject: "رمز إعادة تعيين كلمة المرور",
      text: `رمز إعادة تعيين كلمة المرور الخاص بك هو: ${otp}.
صلاحية الرمز: 10 دقائق.`,
    });

    res.json({ message: "تم إرسال رمز OTP إلى بريدك الإلكتروني" });
    console.log("🔑 OTP:", otp);

  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "حدث خطأ أثناء إرسال OTP", error: err.message });
  }
};

    
const resetPassword = async (req, res) => {
  try {
    const { email, otp, password, confirmPassword } = req.body;
    console.log("Received reset request:", { email, otp, password, confirmPassword });

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'كلمة المرور وتأكيدها غير متطابقين' });
       
    }

    // البحث عن المستخدم
    const user = await usermodele.findOne({ email });
    console.log("User found in DB:", user);

    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    // التحقق من OTP وتاريخ الانتهاء
    if (user.resetPasswordOtp !== otp || user.resetPasswordOtpExpires < Date.now()) {
      console.log("OTP mismatch or expired:", user.resetPasswordOtp, user.resetPasswordOtpExpires);
      return res.status(400).json({ message: 'رمز OTP غير صحيح أو منتهي الصلاحية' });
    }

    // تحديث كلمة المرور
    user.password = password;
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpires = undefined;
    await user.save({ validateBeforeSave: false });

    res.json({ message: 'تم تغيير كلمة المرور بنجاح' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'حدث خطأ أثناء تغيير كلمة المرور', error: err.message });
  }

};




//logout 

// controllers/logoutController.js
const logoutUser = (req, res) => {
  try {
    // لو مخزن التوكن في cookie، امسحه
    res.clearCookie('token'); // اسم الكوكيز حسب ما انت محدد في login

    // لو محتاج ترجع رسالة
    return res.status(200).json({ message: 'تم تسجيل الخروج بنجاح' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'حدث خطأ أثناء تسجيل الخروج' });
  }
};





module.exports = { createUser, getusers, login_user, logoutUser,getProfile ,updateUser, forgotPassword,
  resetPassword,updatePreferences};