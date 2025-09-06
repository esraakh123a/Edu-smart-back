// message routes
const express = require("express");
const router = express.Router();
const messageController = require("../controllers/message");
const auth = require('../middleware/auth');
// Send message
router.post("/", auth, messageController.sendMessage);
router.get("/:conversationId", auth, messageController.getMessagesByConversation);
router.delete("/:id", auth, messageController.deleteMessage);


module.exports = router;
