const test = require('node:test');
const assert = require('node:assert/strict');
const {
    timeToMilliseconds,
    sumRuntimeMs,
    getRuntimeMs,
    withRuntimeMs
} = require('../src/utils/runtime');

test('runtime seconds are rounded individually to milliseconds before summing', () => {
    assert.equal(sumRuntimeMs(['0.011', '0.011']), 22);
    assert.equal(timeToMilliseconds('0.0110000000000000001'), 11);
});

test('missing or invalid runtime values become zero milliseconds', () => {
    assert.equal(timeToMilliseconds(null), 0);
    assert.equal(timeToMilliseconds(undefined), 0);
    assert.equal(timeToMilliseconds('abc'), 0);
});

test('legacy submissions convert their seconds runtime to milliseconds', () => {
    assert.equal(getRuntimeMs({ runtime: 0.011 }), 11);
    assert.equal(withRuntimeMs({ runtime: 0.011 }).runtimeMs, 11);
});

test('new submissions use their stored integer runtimeMs', () => {
    assert.equal(getRuntimeMs({ runtimeMs: 7, runtime: 0.011 }), 7);
    assert.equal(withRuntimeMs({ runtimeMs: 7 }).runtimeMs, 7);
});
