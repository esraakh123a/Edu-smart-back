const express = require('express');
const router = express.Router();
const {createOrder,captureOrder} = require('../controllers/Payment');
const auth = require('../middleware/auth');
router.post('/create-order',createOrder);
router.get('/capture-order',captureOrder);
module.exports = router;
