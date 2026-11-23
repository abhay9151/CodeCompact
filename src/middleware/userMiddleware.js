const jwt = require('jsonwebtoken');
const redisClient = require('../config/redis');
const User = require('../models/user');

const userMiddleware = async (req, res, next) => {
    try {
        const { token } = req.cookies;
        if (!token) {
            throw new Error('Token not found');
        }

        const payload = jwt.verify(token, process.env.JWT_KEY);
        const { _id } = payload;
        const result = await User.findById(_id);
        if (!result) {
            throw new Error('User not found');
        }

        const isBlocked = await redisClient.get(`token:${token}`);
        if (isBlocked) {
            throw new Error('Token is blocked');
        }
        req.result = result;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, error: error.message });
    }
};

module.exports = userMiddleware;
