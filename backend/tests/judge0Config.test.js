const test = require('node:test');
const assert = require('node:assert/strict');
const { getJudge0Options } = require('../src/services/judge0.config');

test('missing Judge0 configuration gives a clear service error', () => {
    assert.throws(
        () => getJudge0Options({}),
        (error) => error.statusCode === 503
            && error.expose === true
            && error.message.includes('JUDGEO_BASE_URL')
    );
});

test('public Judge0 base URL requires no RapidAPI key or headers', () => {
    const options = getJudge0Options({ JUDGEO_BASE_URL: 'https://ce.judge0.com' });

    assert.equal(options.baseURL, 'https://ce.judge0.com');
    assert.equal(options.headers['x-rapidapi-key'], undefined);
    assert.equal(options.headers['x-rapidapi-host'], undefined);
});

test('hosted Judge0 configuration adds RapidAPI headers without exposing the key in the URL', () => {
    const options = getJudge0Options({
        JUDGEO_HOST: 'judge0-ce.p.rapidapi.com',
        JUDGEO_KEY: 'test-key'
    });

    assert.equal(options.baseURL, 'https://judge0-ce.p.rapidapi.com');
    assert.equal(options.headers['x-rapidapi-key'], 'test-key');
    assert.equal(options.headers['x-rapidapi-host'], 'judge0-ce.p.rapidapi.com');
    assert.equal(options.baseURL.includes('test-key'), false);
});

test('self-hosted Judge0 accepts a full URL without RapidAPI credentials', () => {
    const options = getJudge0Options({
        JUDGEO_HOST: 'http://localhost:2358/',
        JUDGEO_KEY: ''
    });

    assert.equal(options.baseURL, 'http://localhost:2358');
    assert.equal(options.headers['x-rapidapi-key'], undefined);
});

test('existing JUDGE0 environment names remain compatible', () => {
    const options = getJudge0Options({
        JUDGE0_HOST: 'judge0-ce.p.rapidapi.com',
        JUDGE0_KEY: 'legacy-test-key'
    });

    assert.equal(options.baseURL, 'https://judge0-ce.p.rapidapi.com');
    assert.equal(options.headers['x-rapidapi-key'], 'legacy-test-key');
});
