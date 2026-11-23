const express = require('express');
const {
    register,
    login,
    logout,
    adminRegister,
    deleteProfile,
    checkUser
} = require('../controllers/userAuth');
const userMiddleware = require('../middleware/userMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const { authRateLimiter } = require('../middleware/rateLimiters');

const authRouter = express.Router();

authRouter.post('/register', authRateLimiter, asyncHandler(register));
authRouter.post('/login', authRateLimiter, asyncHandler(login));
authRouter.post('/logout', userMiddleware, asyncHandler(logout));
authRouter.post('/admin/register', adminMiddleware, asyncHandler(adminRegister));
authRouter.delete('/deleteProfile', userMiddleware, asyncHandler(deleteProfile));
authRouter.get('/check', userMiddleware, checkUser);

module.exports = authRouter;
