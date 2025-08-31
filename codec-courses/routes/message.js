// message routes
const express = require("express");
const router = express.Router();
const messageController = require("../controllers/message");
const auth = require('../middleware/auth');
// Send message
router.post("/send", messageController.sendMessage);

// Get messages by conversation
router.get("/get/:conversationId", messageController.getMessagesByConversation);

// Delete message
router.delete("/delete/:id", messageController.deleteMessage);

module.exports = router;
