const mongoose = require("mongoose");
const Conversation = require("../models/Conversation");
const Message = require("../models/message");

const conversationController = {
  // إنشاء محادثة جديدة أو جلب الموجودة
  createConversation: async (req, res) => {
    try {
      let { userId1, userId2 } = req.body;
      if (!userId1 || !userId2)
        return res.status(400).json({ message: "Both user IDs are required" });

      // تأكد إن الـ IDs Strings أو ObjectId
      if (!mongoose.Types.ObjectId.isValid(userId1) || !mongoose.Types.ObjectId.isValid(userId2)) {
        return res.status(400).json({ message: "Invalid user IDs" });
      }

      userId1 = userId1.toString();
      userId2 = userId2.toString();

      // شوف لو المحادثة موجودة
      let conversation = await Conversation.findOne({
        participants: { $all: [userId1, userId2] }
      });

      if (!conversation) {
        conversation = new Conversation({ participants: [userId1, userId2] });
        await conversation.save();
      }

      res.status(200).json(conversation);
    } catch (error) {
      console.error("CreateConversation Error:", error);
      res.status(500).json({ message: error.message });
    }
  },

  // جلب كل المحادثات الخاصة بمستخدم (مع آخر رسالة)
  getUserConversations: async (req, res) => {
    try {
      const userId = req.user.id.toString(); // ID كـ String
      console.log("Fetching conversations for user:", userId);

      // جلب كل المحادثات اللي فيها المستخدم سواء String أو ObjectId
      const conversations = await Conversation.find({
        participants: userId
      })
      .sort({ updatedAt: -1 })
      .lean();

      // إضافة آخر رسالة لكل محادثة
      for (let conv of conversations) {
        const lastMsg = await Message.findOne({ conversationId: conv._id })
          .sort({ createdAt: -1 })
          .populate("sender", "name email")
          .populate("receiver", "name email");

        conv.lastMessageData = lastMsg || null;
      }

      console.log("Conversations fetched:", conversations);
      res.status(200).json(conversations);
    } catch (error) {
      console.error("getUserConversations Error:", error);
      res.status(500).json({ message: error.message });
    }
  },

  updateLastMessage: async (req, res) => {
    try {
      const { conversationId, text } = req.body;
      const updated = await Conversation.findByIdAndUpdate(
        conversationId,
        { lastMessage: text, lastMessageSender: req.user.id },
        { new: true }
      );
      if (!updated) return res.status(404).json({ message: "Conversation not found" });
      res.status(200).json(updated);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // حذف محادثة وكل الرسائل المرتبطة بيها
  deleteConversation: async (req, res) => {
    try {
      const convId = req.params.id;
      const deleted = await Conversation.findByIdAndDelete(convId);
      if (!deleted) return res.status(404).json({ message: "Conversation not found" });

      await Message.deleteMany({ conversationId: convId });

      res.status(200).json({ message: "Conversation and messages deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = conversationController;
