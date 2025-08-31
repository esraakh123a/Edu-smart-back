const express = require('express');
const router = express.Router();
const {handleChat} = require('../controllers/chatbot');
router.post('/chat',handleChat);
module.exports = router;