const axios = require('axios');
const { getLanguageById } = require('../utils/problemUtility');
const { getJudge0Options } = require('./judge0.config');

const judge0RequestError = (error) => {
    const status = error.response?.status;
    let message = 'Judge0 service is unavailable. Check its host configuration and service status.';
    let statusCode = 503;

    if (status === 401 || status === 403) {
        message = 'Judge0 authentication failed. Check the configured Judge0 access settings.';
        statusCode = 502;
    } else if (status === 429) {
        message = 'Judge0 rate limit reached. Please try again later.';
        statusCode = 429;
    } else if (status >= 400 && status < 500) {
        message = `Judge0 rejected the submission (HTTP ${status}).`;
        statusCode = 502;
    }

    const requestError = new Error(message);
    requestError.statusCode = statusCode;
    requestError.expose = true;
    return requestError;
};

const requestJudge0 = async (method, url, options) => {
    try {
        return await axios.request({ method, url, ...options });
    } catch (error) {
        throw judge0RequestError(error);
    }
};

const submitBatch = async (submissions) => {
    const response = await requestJudge0('post', '/submissions/batch', {
        ...getJudge0Options(),
        data: { submissions },
        params: { base64_encoded: 'false' }
    });

    const result = response.data;
    if (!Array.isArray(result) || result.length === 0 || result.some(({ token }) => !token)) {
        throw new Error('Judge0 returned no submission tokens');
    }

    return result;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const decodeBase64Field = (value) => (
    typeof value === 'string' && value.length > 0
        ? Buffer.from(value, 'base64').toString('utf8')
        : value
);

const decodeSubmissionOutput = (submission) => ({
    ...submission,
    stdout: decodeBase64Field(submission.stdout),
    stderr: decodeBase64Field(submission.stderr),
    compile_output: decodeBase64Field(submission.compile_output)
});

const submitToken = async (resultTokens) => {
    if (!Array.isArray(resultTokens) || resultTokens.length === 0) {
        throw new Error('Cannot poll Judge0 without submission tokens');
    }

    const options = getJudge0Options();
    for (let poll = 0; poll < 15; poll += 1) {
        const response = await requestJudge0('get', '/submissions/batch', {
            ...options,
            params: {
                tokens: resultTokens.join(','),
                base64_encoded: 'true',
                fields: '*'
            }
        });
        const submissions = response.data?.submissions;
        if (!Array.isArray(submissions)) {
            throw new Error('Judge0 returned an invalid batch submission response');
        }
        if (submissions.every(({ status_id }) => status_id > 2)) {
            return submissions.map(decodeSubmissionOutput);
        }

        if (poll < 14) {
            await sleep(1000);
        }
    }

    throw new Error('Judge0 submissions did not finish after 15 polls');
};

const runBatch = async (code, languageName, testCases) => {
    const languageId = getLanguageById(languageName);
    if (!languageId) {
        throw new Error(`Unsupported Judge0 language: ${languageName}`);
    }
    if (!Array.isArray(testCases) || testCases.length === 0) {
        throw new Error('At least one test case is required to run a Judge0 batch');
    }

    const submissions = testCases.map(({ input, output }) => ({
        source_code: code,
        language_id: languageId,
        stdin: input,
        expected_output: output
    }));
    const batch = await submitBatch(submissions);
    const results = await submitToken(batch.map(({ token }) => token));
    if (results.length !== testCases.length) {
        throw new Error('Judge0 returned an unexpected number of test case results');
    }
    return results;
};

const validateReferenceSolutions = async (referenceSolution, testCases) => {
    if (!Array.isArray(referenceSolution) || referenceSolution.length === 0) {
        throw new Error('At least one reference solution is required');
    }

    const resultsByLanguage = [];
    for (const { language, completeCode } of referenceSolution) {
        let results;
        try {
            results = await runBatch(completeCode, language, testCases);
        } catch (error) {
            throw new Error(`${language} reference solution validation failed: ${error.message}`, { cause: error });
        }

        const failedResultIndex = results.findIndex(({ status_id }) => status_id !== 3);
        if (failedResultIndex !== -1) {
            const result = results[failedResultIndex];
            const details = result.status?.description || result.stderr || result.compile_output || 'unknown execution error';
            throw new Error(
                `${language} reference solution failed on test case ${failedResultIndex + 1}: ${details}`
            );
        }
        resultsByLanguage.push({ language, results });
    }

    return resultsByLanguage;
};

module.exports = { submitBatch, submitToken, runBatch, validateReferenceSolutions };
