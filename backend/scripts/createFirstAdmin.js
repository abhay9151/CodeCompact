const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const connectDatabase = require('../src/config/db');
const User = require('../src/models/user');
const validate = require('../src/utils/validator');

const createFirstAdmin = async () => {
    const { ADMIN_EMAIL: emailId, ADMIN_PASSWORD: password } = process.env;
    if (!emailId || !password) {
        throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set');
    }

    validate({ firstName: 'Admin', emailId, password });
    await connectDatabase();

    if (await User.exists({ role: 'admin' })) {
        throw new Error('An admin user already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
        firstName: 'Admin',
        emailId,
        password: hashedPassword,
        role: 'admin'
    });
    console.log(`First admin created for ${emailId}`);
};

createFirstAdmin()
    .catch((error) => {
        console.error('Failed to create first admin:', error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
    });
