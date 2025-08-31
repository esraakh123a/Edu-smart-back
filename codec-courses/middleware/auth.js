const jwt =require("jsonwebtoken");

const auth = (req, res, next) => {
  // 1. استقبل الهيدر
  const authHeader = req.header("Authorization");

  // 2. لو مش موجود
  if (!authHeader) {
    return res.status(401).json({ message: "Access Denied: No token provided" });
  }

  // 3. شيل كلمة Bearer لو موجودة
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;

  try {
    // 4. فك التوكن
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 5. خزّن البيانات في req علشان نستخدمها بعدين
    req.user = {
      id: decoded.id,
      role: decoded.role
    };
    // 6. كمل للراوت اللي بعده
    next();
  } catch (err) {
    return res.status(400).json({ message: "Invalid Token" });
  }
};




// const isAdmin = (req, res, next) => {
//     if (req.user.role !== "admin") {
//         return res.status(403).json({ message: "عذراً، هذا الإجراء متاح فقط للمسؤولين (الأدمن)" });
//     }
//     next();
// };



// const isInstructor = (req, res, next) => {
//     if (req.user.role !== "instructor") {
//         return res.status(403).json({ message: "عذراً، هذا الإجراء متاح فقط للمدرس (Instructor)" });
//     }
//     next();
// };



// const isAdminOrInstructor = (req, res, next) => {
//     if (req.user.role !== "admin" && req.user.role !== "instructor") {
//         return res.status(403).json({ message: "عذراً، هذا الإجراء متاح فقط للأدمن أو المدرس (Instructor)" });
//     }
//     next();
// };


module.exports = auth;

// // module.exports = auth;
// const auth = (roles = []) => {
//   // roles: array of allowed roles, e.g., ["admin", "student"]
//   return (req, res, next) => {
//     try {
//       const authHeader = req.header("Authorization");
//       if (!authHeader) {
//         return res.status(401).json({ message: "Access Denied: No token provided" });
//       }

//       const token = authHeader.startsWith("Bearer ")
//         ? authHeader.split(" ")[1]
//         : authHeader;

//       if (!token) {
//         return res.status(401).json({ message: "Access Denied: Invalid token format" });
//       }

//       // فك التوكن
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);

//       if (!decoded.id) {
//         return res.status(401).json({ message: "Invalid token: user ID missing" });
//       }

//       // خزّن الـ user في req مع تحويل الـ id لـ ObjectId
//       req.user = {
//         id: mongoose.Types.ObjectId(decoded.id),
//         role: decoded.role
//       };

//       // لو فيه roles محددة، تحقق من صلاحية المستخدم
//       if (roles.length > 0 && !roles.includes(req.user.role)) {
//         return res.status(403).json({ message: "Access Denied: Insufficient permissions" });
//       }

//       next();
//     } catch (err) {
//       if (err.name === "TokenExpiredError") {
//         return res.status(401).json({ message: "Token expired" });
//       } else if (err.name === "JsonWebTokenError") {
//         return res.status(401).json({ message: "Invalid token" });
//       } else {
//         return res.status(500).json({ message: "Internal server error" });
//       }
//     }
//   };
// };

// module.exports = auth;