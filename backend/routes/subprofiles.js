const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

// Middleware to verify JWT and attach user to req
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}

// List sub-profiles
router.get('/', auth, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user.subProfiles);
});

// Add sub-profile
router.post('/', auth, async (req, res) => {
  const { name, avatar } = req.body;
  if (!name) return res.status(400).json({ message: 'Name required' });
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.subProfiles.push({ name, avatar });
  await user.save();
  res.status(201).json(user.subProfiles[user.subProfiles.length - 1]);
});

// Edit sub-profile
router.put('/:subProfileId', auth, async (req, res) => {
  const { name, avatar } = req.body;
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  const sub = user.subProfiles.id(req.params.subProfileId);
  if (!sub) return res.status(404).json({ message: 'Sub-profile not found' });
  if (name) sub.name = name;
  if (avatar) sub.avatar = avatar;
  await user.save();
  res.json(sub);
});

// Delete sub-profile
router.delete('/:subProfileId', auth, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  const sub = user.subProfiles.id(req.params.subProfileId);
  if (!sub) return res.status(404).json({ message: 'Sub-profile not found' });
  sub.remove();
  await user.save();
  res.json({ message: 'Sub-profile deleted' });
});

module.exports = router; 