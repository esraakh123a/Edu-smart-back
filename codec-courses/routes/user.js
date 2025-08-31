const express =require("express");
const router =express.Router();
const {createUser,getusers,login_user, logoutUser,getProfile,forgotPassword ,resetPassword,updateUser,updatePreferences}=require("../controllers/user");
const upload = require("../controllers/cloudinary");
const auth = require("../middleware/auth");

// عام
router.get("/public", getusers);

router.get("/profile", auth,getProfile);

router.post("/register",upload.single("certificate"),createUser)


router.post("/login",login_user)
router.post("/loge-out",logoutUser)

 router.put("/update", updateUser);

 router.put("/preferences", updatePreferences);



 //forget password
 // طلب إعادة تعيين كلمة المرور
router.post("/forget-password",forgotPassword);

// إعادة تعيين كلمة المرور
router.post("/reset-password", resetPassword);





module.exports = router;
