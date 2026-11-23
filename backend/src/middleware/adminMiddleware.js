const jwt = require('jsonwebtoken');
const redisClient = require('../config/redis');
const User = require('../models/user');

const adminMiddleware = async (req, res, next) => {
    try {
        const { token } = req.cookies;
        if (!token) {
            throw new Error('Token not found');
        }

        const payload = jwt.verify(token, process.env.JWT_KEY);
        const user = await User.findById(payload._id);
        if (!user) {
            throw new Error('User not found');
        }
        if (user.role !== 'admin') {
            throw new Error('User is not admin');
        }

        const isBlocked = await redisClient.get(`token:${token}`);
        if (isBlocked) {
            throw new Error('Token is blocked');
        }
        req.result = user;
        return next();
    } catch (error) {
        return res.status(401).json({ message: error.message });
    }
};

module.exports = adminMiddleware;
