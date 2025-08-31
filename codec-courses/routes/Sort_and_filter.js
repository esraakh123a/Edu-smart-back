const express = require('express');
const router = express.Router();
const { sort_and_filter } = require('../controllers/Sort_and_filters');

router.get('/', sort_and_filter);

module.exports = router;