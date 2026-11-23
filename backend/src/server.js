const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = require('./app');
const connectDatabase = require('./config/db');
const redisClient = require('./config/redis');

const startServer = async () => {
    await Promise.all([connectDatabase(), redisClient.connect()]);
    console.log('Database and Redis connected successfully');
    app.listen(process.env.PORT, () => {
        console.log(`Server is listening at port no:${process.env.PORT}`);
    });
};

startServer().catch((error) => {
    console.error('Failed to start server:', error);
    process.exitCode = 1;
});
