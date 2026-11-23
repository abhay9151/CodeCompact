const express = require('express');
const userMiddleware = require('../middleware/userMiddleware');
const { runCode, submitCode } = require('../controllers/userSubmission');

const submissionRouter = express.Router();
const asyncHandler = require('../utils/asyncHandler');

submissionRouter.post('/run/:id', userMiddleware, asyncHandler(runCode));
submissionRouter.post('/submit/:id', userMiddleware, asyncHandler(submitCode));

module.exports = submissionRouter;
