const express = require('express');
const router = express.Router();
const { createRating, createOrUpdateRating } = require('../controllers/rating');
const auth = require('../middleware/auth');
router.post('/create',  createRating);
router.post('/update',  createOrUpdateRating);

module.exports = router;