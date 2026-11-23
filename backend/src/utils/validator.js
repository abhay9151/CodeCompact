const validator = require('validator');

const invalidInput = (message) => {
    const error = new Error(message);
    error.statusCode = 400;
    return error;
};

const validate = (data) => {
    const { firstName, lastName, emailId, age, password } = data || {};

    if (typeof firstName !== 'string' || firstName.trim().length < 3) {
        throw invalidInput('First name must be at least 3 characters');
    }

    if (firstName.trim().length > 25) {
        throw invalidInput('First name must be 25 characters or fewer');
    }

    if (lastName !== undefined && lastName !== null) {
        if (typeof lastName !== 'string') {
            throw invalidInput('Last name must be a string');
        }
        if (lastName.trim().length > 25) {
            throw invalidInput('Last name must be 25 characters or fewer');
        }
    }

    if (typeof emailId !== 'string' || !validator.isEmail(emailId)) {
        throw invalidInput('Invalid email');
    }

    if (age !== undefined && age !== null && (age < 6 || age > 100)) {
        throw invalidInput('Invalid age');
    }

    if (typeof password !== 'string' || !validator.isStrongPassword(password)) {
        throw invalidInput('Password must be strong');
    }
};

module.exports = validate;