const express = require('express');
const router = express.Router();
const {createOrder,captureOrder} = require('../controllers/Payment');
const auth = require('../middleware/auth');
router.post('/create-order',auth,createOrder);
router.get('/capture-order',auth,captureOrder);
module.exports = router;
