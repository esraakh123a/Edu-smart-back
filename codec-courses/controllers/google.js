const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/google'); // نموذج المستخدم بتاعك
require('dotenv').config();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleLogin = async (req, res) => {
  try {
    const { token, role } = req.body; // idToken و role لو موجود
    if (!token) return res.status(400).json({ message: "Token is required" });

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name, picture } = ticket.getPayload();

    // البحث عن المستخدم
    let user = await User.findOne({ email });

    // إذا المستخدم جديد، نضيفه مع الدور
    if (!user) {
      user = await User.create({ name, email, picture, role: role || 'student', isApproved: role === 'instructor' ? false : true });
    } else if (role && !user.role) {
      // تحديث الدور إذا المستخدم جديد و اختار دور
      user.role = role;
      user.isApproved = role === 'instructor' ? false : true;
      await user.save();
    }

    // إنشاء JWT
    const appToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token: appToken, user });
  } catch (err) {
    console.error("Google Login Error:", err);
    res.status(401).json({ message: "Google login failed" });
  }
};

module.exports = { googleLogin };
