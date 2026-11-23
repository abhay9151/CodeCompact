const express = require('express');
const adminMiddleware = require('../middleware/adminMiddleware');
const {
    createUploadSignature,
    saveVideo,
    deleteVideo
} = require('../controllers/videoSection');

const videoRouter = express.Router();
const asyncHandler = require('../utils/asyncHandler');

videoRouter.use(adminMiddleware);
videoRouter.get('/create/:problemId', asyncHandler(createUploadSignature));
videoRouter.post('/save', asyncHandler(saveVideo));
videoRouter.delete('/delete/:problemId', asyncHandler(deleteVideo));

module.exports = videoRouter;
