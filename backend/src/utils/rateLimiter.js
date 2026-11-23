const redisClient = require('../config/redis');

const rateLimit = async ({ key, maxRequests, windowSeconds = 60 }) => {
    const count = await redisClient.incr(key);
    if (count === 1) {
        await redisClient.expire(key, windowSeconds);
    }
    return count <= maxRequests;
};

module.exports = rateLimit;
