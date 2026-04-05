const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');

router.get('/', chatbotController.chatbotSearch);

module.exports = router;
