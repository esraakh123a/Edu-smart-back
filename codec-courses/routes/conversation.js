const express = require("express");
const authMiddleware = require("../middleware/auth");
const router = express.Router();
const conversationController = require("../controllers/conversation");

// ✅ إنشاء محادثة جديدة أو جلب الموجودة
router.post("/", authMiddleware, conversationController.createConversation);

// ✅ جلب كل المحادثات الخاصة بمستخدم
router.get("/", authMiddleware, conversationController.getUserConversations);

// ✅ تحديث آخر رسالة
router.put("/last-message", authMiddleware, conversationController.updateLastMessage);

// ✅ حذف محادثة
router.delete("/:id", authMiddleware, conversationController.deleteConversation);

module.exports = router;
