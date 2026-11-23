const test = require('node:test');
const assert = require('node:assert/strict');
const validate = require('../src/utils/validator');

const validInput = (firstName) => ({
    firstName,
    emailId: 'person@example.com',
    password: 'StrongPass1!'
});

test('first names with 25 characters pass', () => {
    assert.doesNotThrow(() => validate(validInput('a'.repeat(25))));
});

test('first names with 26 characters fail with a plain limit message', () => {
    assert.throws(
        () => validate(validInput('a'.repeat(26))),
        (error) => error.statusCode === 400
            && error.message === 'First name must be 25 characters or fewer'
    );
});

test('first names with fewer than 3 characters fail', () => {
    assert.throws(
        () => validate(validInput('ab')),
        (error) => error.statusCode === 400
            && error.message === 'First name must be at least 3 characters'
    );
});

test('leading and trailing spaces are trimmed before counting characters', () => {
    assert.doesNotThrow(() => validate(validInput(`  ${'a'.repeat(25)}  `)));
});
