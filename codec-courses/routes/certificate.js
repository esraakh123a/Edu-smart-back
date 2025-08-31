const express = require('express');
const Router = express.Router();
const {issueCertificate} = require('../controllers/certificate');
const auth = require('../middleware/auth');
Router.post('/issue',issueCertificate);
module.exports = Router;
