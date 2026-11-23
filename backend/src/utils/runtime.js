const timeToMilliseconds = (time) => {
    const seconds = Number.parseFloat(time);
    return Number.isFinite(seconds) ? Math.round(seconds * 1000) : 0;
};

const sumRuntimeMs = (times) => times.reduce(
    (total, time) => total + timeToMilliseconds(time),
    0
);

const getRuntimeMs = (document) => (
    document.runtimeMs ?? Math.round((document.runtime || 0) * 1000)
);

const withRuntimeMs = (document) => {
    const submission = typeof document.toObject === 'function'
        ? document.toObject()
        : { ...document };
    if (typeof submission.memory === 'number' && Number.isFinite(submission.memory)) {
        submission.memory = Math.round(submission.memory);
    }
    return { ...submission, runtimeMs: getRuntimeMs(document) };
};

module.exports = { timeToMilliseconds, sumRuntimeMs, getRuntimeMs, withRuntimeMs };
