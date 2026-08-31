const validator = require('validator');

const validate = (data) => {
    const { firstName, lastName, emailId, age, password } = data;

    if (!firstName || firstName.length < 3) {
        throw new Error("First name is invalid");
    }

    if (lastName && lastName.length < 3) {
        throw new Error("Last name is invalid");
    }

    if (!validator.isEmail(emailId)) {
        throw new Error("Invalid email");
    }

    if (age && (age < 6 || age > 100)) {
        throw new Error("Invalid age");
    }

    if (!password || password.length < 8) {
        throw new Error("Password must be at least 8 characters");
    }
};

module.exports = validate;