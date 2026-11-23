const express = require('express');
const adminMiddleware = require('../middleware/adminMiddleware');
const userMiddleware = require('../middleware/userMiddleware');
const {
    createProblem,
    updateProblem,
    deleteProblem,
    getProblemById,
    getAllProblem,
    getProblemSolvedByUser,
    getSubmittedProblem
} = require('../controllers/userProblem');

const problemRouter = express.Router();
const asyncHandler = require('../utils/asyncHandler');

problemRouter.post('/create', adminMiddleware, asyncHandler(createProblem));
problemRouter.put('/update/:id', adminMiddleware, asyncHandler(updateProblem));
problemRouter.delete('/delete/:id', adminMiddleware, asyncHandler(deleteProblem));
problemRouter.get('/problemById/:id', userMiddleware, asyncHandler(getProblemById));
problemRouter.get('/getAllProblem', userMiddleware, asyncHandler(getAllProblem));
problemRouter.get('/problemSolvedByUser', userMiddleware, asyncHandler(getProblemSolvedByUser));
problemRouter.get('/submittedProblem/:pid', userMiddleware, asyncHandler(getSubmittedProblem));

module.exports = problemRouter;
