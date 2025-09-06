// controllers/messageController.js
const Message = require('../models/message');
const Conversation = require('../models/Conversation');

// إرسال رسالة
const sendMessage = async (req, res) => {
  try {
    let { conversationId, sender, receiver, text } = req.body;

    if (!sender || !receiver || !text) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    let conversation;

    // ✅ لو مفيش conversationId، نشوف هل في محادثة قديمة
    if (!conversationId) {
      conversation = await Conversation.findOne({
        participants: { $all: [sender, receiver] }
      });

      // ❌ لو مفيش محادثة قديمة → نعمل واحدة جديدة
      if (!conversation) {
        conversation = new Conversation({
          participants: [sender, receiver]
        });
        await conversation.save();
      }

      conversationId = conversation._id;
    } else {
      // ✅ لو في conversationId → نجيبه
      conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' });
      }
    }

    // ✅ إنشاء الرسالة
    const message = new Message({
      conversationId,
      sender,
      receiver,
      text
    });
    await message.save();

    // ✅ تحديث المحادثة
    conversation.lastMessage = text;
    conversation.lastMessageSender = sender;
    conversation.updatedAt = Date.now();
    await conversation.save();

    // ✅ بث الرسالة عبر Socket.IO
    const io = req.app.get('io');
    io.to(conversationId.toString()).emit('new message', message);

    res.status(201).json(message);
  } catch (error) {
    console.error('SendMessage Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// جلب جميع الرسائل في محادثة
const getMessagesByConversation = async (req, res) => {
  try {
    const conversationId = req.params.conversationId;
    const messages = await Message.find({ conversationId })
      .populate('sender', 'name email')
      .populate('receiver', 'name email')
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// حذف رسالة
const deleteMessage = async (req, res) => {
  try {
    const deletedMessage = await Message.findByIdAndDelete(req.params.id);
    if (!deletedMessage) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // لو الرسالة المحذوفة هي آخر رسالة في المحادثة
    const conversation = await Conversation.findById(deletedMessage.conversationId);
    if (conversation && conversation.lastMessage === deletedMessage.text) {
      const lastMsg = await Message.find({ conversationId: conversation._id })
        .sort({ createdAt: -1 })
        .limit(1);

      conversation.lastMessage = lastMsg[0]?.text || '';
      conversation.lastMessageSender = lastMsg[0]?.sender || null;
      await conversation.save();
    }

    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendMessage,
  getMessagesByConversation,
  deleteMessage
};
