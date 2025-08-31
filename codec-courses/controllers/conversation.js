const Conversation = require("../models/Conversation");
const Message = require("../models/message");
const User = require("../models/User");
const conversationController = {
    // إنشاء محادثة جديدة أو جلب الموجودة
    createConversation: async (req, res) => {
        try {
            const { userId1, userId2 } = req.body;

            if (!userId1 || !userId2) {
                return res.status(400).json({ message: "Both user IDs are required" });
            }

            // البحث لو المحادثة موجودة بالفعل
            let conversation = await Conversation.findOne({
                participants: { $all: [userId1, userId2] }
            });

            if (!conversation) {
                // إنشاء محادثة جديدة
                conversation = new Conversation({
                    participants: [userId1, userId2]
                });
                await conversation.save();
            }

            res.status(200).json(conversation);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // جلب كل المحادثات الخاصة بمستخدم
    getUserConversations: async (req, res) => {
        try {
            const conversationId = req.params.id;
            const userId = req.user.id; // المستلم الحالي
    
            // جلب آخر رسالة في المحادثة
            const message = await Message.findOne({ conversationId })
                .sort({ createdAt: -1 });
    
            if (!message) {
                return res.status(404).json({ message: 'No messages found' });
            }
    
            // لو المستلم الحالي هو اللي بيشوف الرسالة، نغير isRead إلى true
            if (message.receiver.toString() === userId && !message.isRead) {
                message.isRead = true;
                await message.save();
            }
    
            res.status(200).json(message);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    // تحديث آخر رسالة
    updateLastMessage: async (req, res) => {
        try {
            const { conversationId, lastMessage } = req.body;

            const conversation = await Conversation.findByIdAndUpdate(
                conversationId,
                { lastMessage, updatedAt: Date.now() },
                { new: true }
            );

            if (!conversation) {
                return res.status(404).json({ message: "Conversation not found" });
            }

            res.status(200).json(conversation);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // حذف محادثة
    deleteConversation: async (req, res) => {
        try {
            const deleted = await Conversation.findByIdAndDelete(req.params.id);
            if (!deleted) {
                return res.status(404).json({ message: "Conversation not found" });
            }
            res.status(200).json({ message: "Conversation deleted successfully" });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = conversationController;
