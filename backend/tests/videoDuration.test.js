const test = require('node:test');
const assert = require('node:assert/strict');
const { getVideoDuration } = require('../src/controllers/videoSection');

test('uses Cloudinary duration when it is valid', () => {
    assert.equal(getVideoDuration(42.5, 40), 42.5);
});

test('falls back to the validated uploaded-file duration when Cloudinary omits it', () => {
    assert.equal(getVideoDuration(undefined, 40), 40);
    assert.equal(getVideoDuration(0, 40), 40);
    assert.equal(getVideoDuration('invalid', 40), 40);
});
