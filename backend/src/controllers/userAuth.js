const User = require('../models/user');
const validate = require('../utils/validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const redisClient = require('../config/redis');

const getCookieOptions = () => ({
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 3600000
});

const setAuthCookie = (res, user) => {
    const token = jwt.sign(
        { _id: user._id, emailId: user.emailId, role: user.role },
        process.env.JWT_KEY,
        { expiresIn: '1h' }
    );
    res.cookie('token', token, getCookieOptions());
};

const getPublicUser = (user) => ({
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    emailId: user.emailId,
    role: user.role
});

const register = async (req, res) => {
    validate(req.body);
    const userData = {
        ...req.body,
        password: await bcrypt.hash(req.body.password, 10),
        role: 'user'
    };
    const user = await User.create(userData);
    setAuthCookie(res, user);
    return res.status(201).json({
        user: getPublicUser(user),
        message: 'User registered successfully'
    });
};

const login = async (req, res) => {
    const { emailId, password } = req.body;
    const user = await User.findOne({ emailId });
    const isPasswordValid = user && typeof password === 'string'
        ? await bcrypt.compare(password, user.password)
        : false;
    if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    setAuthCookie(res, user);
    return res.status(200).json({
        user: getPublicUser(user),
        message: 'User logged in successfully'
    });
};

const logout = async (req, res) => {
    const { token } = req.cookies;
    const payload = jwt.decode(token);
    if (!payload?.exp) {
        return res.status(401).json({ message: 'Invalid token' });
    }

    const ttl = payload.exp - Math.floor(Date.now() / 1000);
    if (ttl > 0) {
        await redisClient.set(`token:${token}`, 'blocked');
        await redisClient.expire(`token:${token}`, ttl);
    }
    res.clearCookie('token', getCookieOptions());
    return res.status(200).json({ message: 'User logged out successfully' });
};

const adminRegister = async (req, res) => {
    validate(req.body);
    const userData = {
        ...req.body,
        password: await bcrypt.hash(req.body.password, 10),
        role: 'admin'
    };
    const user = await User.create(userData);
    setAuthCookie(res, user);
    return res.status(201).json({
        user: getPublicUser(user),
        message: 'Admin registered successfully'
    });
};

const deleteProfile = async (req, res) => {
    const user = await User.findOneAndDelete({ _id: req.result._id });
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    res.clearCookie('token', getCookieOptions());
    return res.status(200).json({ message: 'User profile deleted successfully' });
};

const checkUser = (req, res) => res.status(200).json({
    user: getPublicUser(req.result),
    message: 'Valid User'
});

module.exports = { register, login, logout, adminRegister, deleteProfile, checkUser };
