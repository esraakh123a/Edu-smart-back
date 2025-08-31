// conversation routes
const express = require("express");
const authMiddleware = require("../middleware/auth");
const router = express.Router();
const conversationController = require("../controllers/conversation");

// Create or get conversation
router.post("/create", conversationController.createConversation);

// Get all user conversations
router.get("/allmessages/:userId", conversationController.getUserConversations);

// Get conversation by ID
router.get("/message/:id", conversationController.getUserConversations);

// Update last message
router.put("/update-last-message",  conversationController.updateLastMessage);

// Delete conversation
router.delete("/delete/conversation/:id",  conversationController.deleteConversation);

module.exports = router;