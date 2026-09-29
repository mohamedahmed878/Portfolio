const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const protect = require('../middleware/auth');

const router = express.Router();

function signToken(userId, expiresIn) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn });
}

function cookieOptions(rememberMe) {
  const isProd = process.env.NODE_ENV === 'production';
  const maxAge = rememberMe
    ? 30 * 24 * 60 * 60 * 1000 // 30 days
    : 24 * 60 * 60 * 1000; // 1 day
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge,
    path: '/',
  };
}

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').isString().notEmpty().withMessage('Password is required'),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { email, password, rememberMe } = req.body;

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const expiresIn = rememberMe
      ? process.env.JWT_EXPIRES_IN_REMEMBER || '30d'
      : process.env.JWT_EXPIRES_IN || '1d';

    const token = signToken(user._id, expiresIn);

    res.cookie('token', token, cookieOptions(Boolean(rememberMe)));

    res.json({
      user: { id: user._id, email: user.email, name: user.name },
    });
  })
);

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('token', { path: '/' });
  res.json({ message: 'Logged out' });
});

// GET /api/auth/me
router.get(
  '/me',
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.userId).select('-passwordHash');
    if (!user) return res.status(401).json({ message: 'Not authenticated' });
    res.json({ user: { id: user._id, email: user.email, name: user.name } });
  })
);

module.exports = router;
