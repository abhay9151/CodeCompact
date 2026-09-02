const {createClient} = require('redis');

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: process.env.HOST_ID,
        port: 19047
    }
});
module.exports = redisClient;