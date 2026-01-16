"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const User_1 = __importDefault(require("../models/User"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const router = (0, express_1.Router)();
function validateUsername(username) {
    if (typeof username !== 'string')
        return 'username must be a string';
    const u = username.trim();
    if (u.length < 3 || u.length > 30)
        return 'username must be between 3 and 30 characters';
    if (!/^[A-Za-z0-9._-]+$/.test(u))
        return 'username may only contain letters, numbers, dot, underscore and hyphen';
    return null;
}
function validatePassword(password) {
    if (typeof password !== 'string')
        return 'password must be a string';
    if (password.length < 8)
        return 'password must be at least 8 characters';
    if (password.length > 128)
        return 'password must be at most 128 characters';
    // at least one letter and one number
    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password))
        return 'password must include at least one letter and one number';
    return null;
}
// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password)
            return res.status(400).json({ message: 'username and password required' });
        const usernameError = validateUsername(username);
        if (usernameError)
            return res.status(400).json({ message: usernameError });
        const passwordError = validatePassword(password);
        if (passwordError)
            return res.status(400).json({ message: passwordError });
        const existing = await User_1.default.findOne({ username });
        if (existing)
            return res.status(409).json({ message: 'username already exists' });
        const user = new User_1.default({ username, password });
        await user.save();
        return res.status(201).json({ id: user._id, username: user.username });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
});
// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password)
            return res.status(400).json({ message: 'username and password required' });
        const user = await User_1.default.findOne({ username });
        if (!user)
            return res.status(401).json({ message: 'Invalid credentials' });
        const ok = await user.comparePassword(password);
        if (!ok)
            return res.status(401).json({ message: 'Invalid credentials' });
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, config_1.JWT_SECRET, { expiresIn: '7d' });
        return res.json({ token, user: { id: user._id, username: user.username } });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
});
exports.default = router;
