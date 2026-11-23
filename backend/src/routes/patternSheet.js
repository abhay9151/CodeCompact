const express = require('express');
const userMiddleware = require('../middleware/userMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const {
    sheet,
    setSolved,
    setRevisionMark,
    markRevised,
    pickRevision,
} = require('../controllers/patternSheet');

const patternRouter = express.Router();

patternRouter.use(userMiddleware);
patternRouter.get('/sheet', asyncHandler(sheet));
patternRouter.patch('/question/:id/solved', asyncHandler(setSolved));
patternRouter.patch('/question/:id/revision-mark', asyncHandler(setRevisionMark));
patternRouter.post('/question/:id/revised', asyncHandler(markRevised));
patternRouter.post('/revision/pick', asyncHandler(pickRevision));

module.exports = patternRouter;
