const {createClient} = require('redis');

const redisClient = createClient({
    username: 'default',
    socket: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT)
    },
    password: process.env.REDIS_PASS
});
module.exports = redisClient;