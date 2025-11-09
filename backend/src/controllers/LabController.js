import Lab from '../models/Lab.js';
import Joi from 'joi';

const labSchema = Joi.object({ name: Joi.string().required(), description: Joi.string().allow('', null) });

export const createLab = async (req, res) => {
  const { error, value } = labSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });
  const lab = await Lab.create(value);
  res.status(201).json(lab);
};

export const listLabs = async (req, res) => {
  const labs = await Lab.find().sort({ name: 1 });
  res.json(labs);
};

export const getLab = async (req, res) => {
  const lab = await Lab.findById(req.params.id);
  if (!lab) return res.status(404).json({ message: 'Lab not found' });
  res.json(lab);
};

export const updateLab = async (req, res) => {
  const { error, value } = labSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });
  const lab = await Lab.findByIdAndUpdate(req.params.id, value, { new: true });
  if (!lab) return res.status(404).json({ message: 'Lab not found' });
  res.json(lab);
};

export const deleteLab = async (req, res) => {
  const lab = await Lab.findByIdAndDelete(req.params.id);
  if (!lab) return res.status(404).json({ message: 'Lab not found' });
  res.json({ message: 'Deleted' });
};
