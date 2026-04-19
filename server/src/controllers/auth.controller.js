import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { signJwt } from '../utils/jwt.js';

const toPublicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  preferences: user.preferences
});

export const register = async (req, res) => {
  const { name, email, password } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: 'Email already exists.' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash });
  res.status(201).json({ id: user._id });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  const token = signJwt({ sub: user._id, email: user.email, name: user.name });
  return res.json({ token, user: toPublicUser(user) });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  res.json({
    message: `If ${email} exists in our system, password reset instructions were sent.`
  });
};

export const getProfile = async (req, res) => {
  const user = await User.findById(req.user.sub);
  if (!user) return res.status(404).json({ message: 'User not found.' });
  return res.json({ user: toPublicUser(user) });
};

export const updateProfile = async (req, res) => {
  const { name, preferences } = req.body;
  const user = await User.findById(req.user.sub);
  if (!user) return res.status(404).json({ message: 'User not found.' });

  user.name = name || user.name;
  if (preferences) {
    user.preferences = {
      ...user.preferences,
      ...preferences
    };
  }

  await user.save();
  return res.json({ user: toPublicUser(user) });
};
