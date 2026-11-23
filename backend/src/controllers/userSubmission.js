const mongoose = require('mongoose');
const Problem = require('../models/problem');
const Submission = require('../models/submission');
const User = require('../models/user');
const rateLimit = require('../utils/rateLimiter');
const { runBatch } = require('../services/judge0.service');
const { timeToMilliseconds, sumRuntimeMs, getRuntimeMs } = require('../utils/runtime');

const MAX_CODE_LENGTH = 20000;
const MAX_REQUESTS_PER_MINUTE = 20;

const normalizeRequest = (req, res) => {
    const { code, language } = req.body || {};
    if (typeof code !== 'string' || !code || typeof language !== 'string' || !language) {
        res.status(400).json({ message: 'code and language are required' });
        return null;
    }
    if (code.length > MAX_CODE_LENGTH) {
        res.status(400).json({ message: `code must be no longer than ${MAX_CODE_LENGTH} characters` });
        return null;
    }

    const normalizedLanguage = language.toLowerCase() === 'cpp'
        ? 'c++'
        : language.toLowerCase();
    if (!['javascript', 'java', 'c++'].includes(normalizedLanguage)) {
        res.status(400).json({ message: 'Unsupported language' });
        return null;
    }

    return { code, language: normalizedLanguage };
};

const getProblem = async (id) => {
    if (!mongoose.isValidObjectId(id)) {
        return null;
    }
    return Problem.findById(id);
};

const mapStatus = (statusId) => {
    switch (statusId) {
        case 3:
            return 'accepted';
        case 4:
            return 'wrong_answer';
        case 5:
            return 'time_limit';
        case 6:
            return 'compile_error';
        default:
            if (statusId >= 7 && statusId <= 12) {
                return 'runtime_error';
            }
            return 'runtime_error';
    }
};

const getResultSummary = (results) => {
    const mappedResults = results.map((result) => ({
        result,
        status: mapStatus(result.status_id)
    }));
    const failedResult = mappedResults.find(({ status }) => status !== 'accepted');
    const status = failedResult?.status || 'accepted';
    const errorMessage = failedResult
        ? failedResult.result.compile_output
            || failedResult.result.stderr
            || failedResult.result.message
            || null
        : null;
    const runtimeMs = sumRuntimeMs(mappedResults.map(({ result }) => result.time));
    const memory = mappedResults.reduce((maximum, { result }) => {
        const value = Number(result.memory);
        return Number.isFinite(value) ? Math.max(maximum, Math.round(value)) : maximum;
    }, 0);

    return {
        status,
        errorMessage,
        runtimeMs,
        memory,
        passedTestCases: mappedResults.filter(({ status: testStatus }) => testStatus === 'accepted').length
    };
};

const prepareRequest = async (req, res) => {
    const submission = normalizeRequest(req, res);
    if (!submission) {
        return null;
    }

    const problem = await getProblem(req.params.id);
    if (!problem) {
        res.status(404).json({ message: 'Problem not found' });
        return null;
    }

    const allowed = await rateLimit({
        key: `submission-rate:${req.result._id}`,
        maxRequests: MAX_REQUESTS_PER_MINUTE
    });
    if (!allowed) {
        res.status(429).json({ message: 'Submission rate limit exceeded' });
        return null;
    }

    return { ...submission, problem };
};

const runCode = async (req, res) => {
    const request = await prepareRequest(req, res);
    if (!request) {
        return;
    }

    let results;
    try {
        results = await runBatch(
            request.code,
            request.language,
            request.problem.visibleTestCases
        );
    } catch (error) {
        return res.status(502).json({ message: 'Judge service unavailable' });
    }

    const summary = getResultSummary(results);
    const testCases = results.map((result, index) => ({
        stdin: request.problem.visibleTestCases[index].input,
        expected_output: request.problem.visibleTestCases[index].output,
        stdout: result.stdout,
        status_id: result.status_id,
        status: result.status,
        runtimeMs: timeToMilliseconds(result.time),
        memory: Number.isFinite(Number(result.memory)) ? Math.round(Number(result.memory)) : 0,
        stderr: result.stderr,
        compile_output: result.compile_output
    }));

    return res.status(200).json({
        success: summary.status === 'accepted',
        testCases,
        runtimeMs: getRuntimeMs(summary),
        memory: summary.memory
    });
};

const submitCode = async (req, res) => {
    const request = await prepareRequest(req, res);
    if (!request) {
        return;
    }

    const testCases = request.problem.hiddenTestCases;
    const submission = await Submission.create({
        userId: req.result._id,
        problemId: request.problem._id,
        code: request.code,
        language: request.language,
        status: 'pending',
        testCasesTotal: testCases.length
    });

    let results;
    try {
        results = await runBatch(request.code, request.language, testCases);
    } catch (error) {
        submission.status = 'runtime_error';
        submission.errorMessage = error.message;
        await submission.save();
        return res.status(502).json({ message: 'Judge service unavailable' });
    }

    const summary = getResultSummary(results);
    submission.status = summary.status;
    submission.runtimeMs = summary.runtimeMs;
    submission.memory = summary.memory;
    submission.errorMessage = summary.errorMessage;
    submission.testCasesPassed = summary.passedTestCases;
    await submission.save();

    if (summary.status === 'accepted') {
        await User.updateOne(
            { _id: req.result._id },
            { $addToSet: { problemSolved: request.problem._id } }
        );
    }

    return res.status(200).json({
        accepted: summary.status === 'accepted',
        status: summary.status,
        totalTestCases: testCases.length,
        passedTestCases: summary.passedTestCases,
        runtimeMs: getRuntimeMs(summary),
        memory: summary.memory,
        errorMessage: summary.errorMessage
    });
};

module.exports = { runCode, submitCode };
