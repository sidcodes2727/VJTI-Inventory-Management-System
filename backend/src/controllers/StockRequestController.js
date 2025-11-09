import Joi from 'joi';
import StockRequest from '../models/StockRequest.js';
import Item from '../models/Item.js';

export const createRequest = async (req, res) => {
  const schema = Joi.object({ itemId: Joi.string().required(), requestedQty: Joi.number().integer().min(1).required() });
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });
  const item = await Item.findById(value.itemId);
  if (!item) return res.status(404).json({ message: 'Item not found' });
  if (String(item.labId) !== String(req.user.labId)) return res.status(403).json({ message: 'Forbidden' });
  const sr = await StockRequest.create({ labId: req.user.labId, itemId: value.itemId, requestedQty: value.requestedQty });
  res.status(201).json(sr);
};

export const listAll = async (req, res) => {
  const list = await StockRequest.find().populate('labId', 'name').populate('itemId', 'name category');
  res.json(list);
};

export const listMine = async (req, res) => {
  const list = await StockRequest.find({ labId: req.user.labId }).populate('itemId', 'name category');
  res.json(list);
};

export const approve = async (req, res) => {
  const sr = await StockRequest.findById(req.params.id);
  if (!sr) return res.status(404).json({ message: 'Request not found' });
  sr.status = 'approved';
  await sr.save();
  res.json(sr);
};

export const reject = async (req, res) => {
  const sr = await StockRequest.findById(req.params.id);
  if (!sr) return res.status(404).json({ message: 'Request not found' });
  sr.status = 'rejected';
  await sr.save();
  res.json(sr);
};
