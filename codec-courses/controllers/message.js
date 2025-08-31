// message
const Message = require('../models/message');
const Conversation = require('../models/Conversation');

// إرسال رسالة
const sendMessage = async (req, res) => {
    try {
        const { conversationId, sender, receiver, text } = req.body;

        if (!conversationId || !sender || !receiver || !text) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const message = new Message({
            conversationId,
            sender,
            receiver,
            text
        });

        await message.save();

        // تحديث آخر رسالة وتاريخ المحادثة
        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: text,
            updatedAt: Date.now()
        });

        // بث الرسالة في Socket.IO
        const io = req.app.get('io');
        io.emit('new message', message);

        res.status(201).json(message);
    } catch (error) {
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
const deleteMessage = async (req, res) => {
    try {
        const deletedMessage = await Message.findByIdAndDelete(req.params.id);
        if (!deletedMessage) {
            return res.status(404).json({ message: 'Message not found' });
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
