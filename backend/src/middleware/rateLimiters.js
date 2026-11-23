const { rateLimit } = require('express-rate-limit');

const createLimiter = (windowMs, limit, message) => rateLimit({
    windowMs,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message }
});

const globalRateLimiter = createLimiter(
    15 * 60 * 1000,
    200,
    'Too many requests. Please try again later.'
);

const authRateLimiter = createLimiter(
    15 * 60 * 1000,
    10,
    'Too many authentication attempts. Please try again later.'
);

module.exports = { globalRateLimiter, authRateLimiter };
