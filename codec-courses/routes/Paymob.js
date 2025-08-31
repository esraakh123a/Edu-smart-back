const express = require('express');
const router = express.Router();
const { generatePayment, paymobWebhook } = require('../controllers/Paymob');
const auth = require('../middleware/auth');
router.post('/generate-payment', auth, generatePayment);
router.post('/webhook', express.json(), auth, paymobWebhook);
module.exports = router;
