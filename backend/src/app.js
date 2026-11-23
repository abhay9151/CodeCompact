const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const authRouter = require('./routes/userAuth');
const problemRouter = require('./routes/problemCreator');
const submissionRouter = require('./routes/submit');
const aiRouter = require('./routes/aiChatting');
const videoRouter = require('./routes/videoCreator');
const patternRouter = require('./routes/patternSheet');
const errorHandler = require('./middleware/errorHandler');
const { globalRateLimiter } = require('./middleware/rateLimiters');

const app = express();

app.use(helmet());
app.use(cors({
    origin: process.env.CLIENT_ORIGIN || false,
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(globalRateLimiter);
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));
app.use('/user', authRouter);
app.use('/problem', problemRouter);
app.use('/submission', submissionRouter);
app.use('/ai', aiRouter);
app.use('/video', videoRouter);
app.use('/pattern', patternRouter);
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
app.use(errorHandler);

module.exports = app;
