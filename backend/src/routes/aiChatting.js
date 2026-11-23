const express = require('express');
const userMiddleware = require('../middleware/userMiddleware');
const { chat } = require('../controllers/solveDoubt');

const aiRouter = express.Router();
const asyncHandler = require('../utils/asyncHandler');

aiRouter.post('/chat', userMiddleware, asyncHandler(chat));

module.exports = aiRouter;
