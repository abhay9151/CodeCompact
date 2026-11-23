const errorHandler = (error, req, res, next) => {
    if (res.headersSent) {
        return next(error);
    }

    const requestedStatus = Number(error.statusCode || error.status);
    const status = requestedStatus >= 400 && requestedStatus <= 599
        ? requestedStatus
        : error.name === 'ValidationError' || error.name === 'CastError'
            ? 400
            : error.code === 11000
                ? 409
                : 500;
    if (status >= 500) {
        console.error('Request failed:', error);
    }

    const message = status >= 500 && !error.expose
        ? 'Internal server error'
        : error.message || 'Request failed';
    return res.status(status).json({ message });
};

module.exports = errorHandler;
