import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Joi from 'joi';
import User from '../models/User.js';

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const signupSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('admin', 'lab').required(),
  labId: Joi.string().when('role', { is: 'lab', then: Joi.required(), otherwise: Joi.optional() })
});

const signToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role, labId: user.labId || null, name: user.name, email: user.email },
    process.env.JWT_SECRET || 'dev_secret',
    { expiresIn: '7d' }
  );

export const login = async (req, res) => {
  const { error, value } = loginSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });
  const user = await User.findOne({ email: value.email });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const ok = await bcrypt.compare(value.password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
  const token = signToken(user);
  res.json({ token, user: { id: user._id, name: user.name, role: user.role, labId: user.labId, email: user.email } });
};

export const signup = async (req, res) => {
  const { error, value } = signupSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });
  const exists = await User.findOne({ email: value.email });
  if (exists) return res.status(409).json({ message: 'Email already in use' });
  const passwordHash = await bcrypt.hash(value.password, 10);
  const user = await User.create({
    name: value.name,
    email: value.email,
    role: value.role,
    labId: value.role === 'lab' ? value.labId : undefined,
    passwordHash
  });
  const token = signToken(user);
  res.status(201).json({ token, user: { id: user._id, name: user.name, role: user.role, labId: user.labId, email: user.email } });
};

export const listUsers = async (req, res) => {
  const users = await User.find({}, { name: 1, email: 1, role: 1, labId: 1, createdAt: 1 })
    .populate('labId', 'name');
  res.json(users);
};

const updateUserSchema = Joi.object({
  name: Joi.string().optional(),
  email: Joi.string().email().optional(),
  role: Joi.string().valid('admin', 'lab').optional(),
  labId: Joi.string().allow(null, '').optional()
});

export const updateUser = async (req, res) => {
  const { error, value } = updateUserSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });
  if (value.role === 'lab' && !value.labId) {
    return res.status(400).json({ message: 'labId required when role is lab' });
  }
  if (value.role === 'admin') {
    value.labId = undefined;
  }
  try {
    const user = await User.findByIdAndUpdate(req.params.id, value, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ id: user._id, name: user.name, email: user.email, role: user.role, labId: user.labId });
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ message: 'Email already in use' });
    throw e;
  }
};

const resetPasswordSchema = Joi.object({ password: Joi.string().min(6).required() });

export const resetPassword = async (req, res) => {
  const { error, value } = resetPasswordSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.passwordHash = await bcrypt.hash(value.password, 10);
  await user.save();
  res.json({ message: 'Password reset' });
};
