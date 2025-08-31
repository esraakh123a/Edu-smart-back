const axios = require('axios');
const ChatMessage = require('../models/chatbot');
const Course = require('../models/Course');
require('dotenv').config();

async function getLastContext(userId, sessionId) {
  const lastMsg = await ChatMessage.findOne({ userId, sessionId }).sort({ timestamp: -1 });
  return lastMsg ? lastMsg.lastContext || lastMsg.message : null;
}

async function findRelatedCourses(message) {
  const keywords = ['javascript', 'js', 'python', 'ai', 'machine learning', 'backend', 'frontend'];
  const lowerMsg = message.toLowerCase();

  for (let keyword of keywords) {
    if (lowerMsg.includes(keyword)) {
      const courses = await Course.find({
        title: { $regex: keyword, $options: 'i' }
      });

      if (courses.length > 0) {
        let reply = `لقيت الكورسات دي المتعلقة بـ ${keyword}:\n\n`;
        courses.forEach(course => {
          reply += `${course.title} - ${course.description}\n السعر: $${course.price}\n\n`;
        });
        return reply;
      }
    }
  }

  return null;
}

exports.handleChat = async (req, res) => {
  const { userId, sessionId, message } = req.body;

  try {
    const lastContext = await getLastContext(userId, sessionId);
    const messages = [];

    if (lastContext) messages.push({ role: "user", content: lastContext });
    messages.push({ role: "user", content: message });

    const suggestedCourses = await findRelatedCourses(message);

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: "mistralai/mistral-7b-instruct",
        messages
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    let botReply = response.data.choices[0].message.content;

    if (suggestedCourses) {
      botReply += `\n\n على فكرة، ${suggestedCourses}`;
    }

    const updatedUser = await ChatMessage.findOneAndUpdate(
      { userId, sessionId, sender: 'user' },
      { message: botReply, lastContext: message },
      { sort: { timestamp: -1 } }
    );
    const updatedBot = await ChatMessage.findOneAndUpdate(
      { userId, sessionId, sender: 'bot' },
      { message: botReply, lastContext: message },
      { sort: { timestamp: -1 } }
    );

    if (!updatedUser) {
      await ChatMessage.create({
        userId,
        sessionId,
        message: botReply,
        sender: 'user',
        lastContext: message,
      });
    }

    if (!updatedBot) {
      await ChatMessage.create({
        userId,
        sessionId,
        message: botReply,
        sender: 'bot',
        lastContext: message,
      });
    }

    res.json({ reply: botReply });

  } catch (error) {
    console.error('Chat error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Chat failed' });
  }
};
