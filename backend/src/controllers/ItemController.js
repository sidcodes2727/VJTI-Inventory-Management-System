import Joi from 'joi';
import Item from '../models/Item.js';

const itemSchema = Joi.object({
  name: Joi.string().required(),
  category: Joi.string().required(),
  totalCount: Joi.number().integer().min(0).default(0),
  workingCount: Joi.number().integer().min(0).default(0),
  damagedCount: Joi.number().integer().min(0).default(0),
  lostCount: Joi.number().integer().min(0).default(0),
  labId: Joi.string().required()
});

const statusSchema = Joi.object({
  workingCount: Joi.number().integer().min(0).required(),
  damagedCount: Joi.number().integer().min(0).required(),
  lostCount: Joi.number().integer().min(0).required()
});

export const createItem = async (req, res) => {
  const { error, value } = itemSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });
  if (value.workingCount + value.damagedCount + value.lostCount !== value.totalCount)
    return res.status(400).json({ message: 'Counts must add up to totalCount' });
  const item = await Item.create(value);
  res.status(201).json(item);
};

export const listItems = async (req, res) => {
  const filter = {};
  if (req.user.role === 'lab') {
    filter.labId = req.user.labId;
  } else if (req.query.labId) {
    filter.labId = req.query.labId;
  }
  const items = await Item.find(filter).populate('labId', 'name');
  res.json(items);
};

export const getItem = async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Item not found' });
  if (req.user.role === 'lab' && String(item.labId) !== String(req.user.labId))
    return res.status(403).json({ message: 'Forbidden' });
  res.json(item);
};

export const updateItem = async (req, res) => {
  const { error, value } = itemSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });
  const item = await Item.findByIdAndUpdate(req.params.id, value, { new: true });
  if (!item) return res.status(404).json({ message: 'Item not found' });
  res.json(item);
};

export const deleteItem = async (req, res) => {
  const item = await Item.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ message: 'Item not found' });
  res.json({ message: 'Deleted' });
};

export const updateItemStatus = async (req, res) => {
  const { error, value } = statusSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Item not found' });
  if (req.user.role === 'lab' && String(item.labId) !== String(req.user.labId))
    return res.status(403).json({ message: 'Forbidden' });
  const newTotal = value.workingCount + value.damagedCount + value.lostCount;
  if (newTotal !== item.totalCount) return res.status(400).json({ message: 'Sum must equal totalCount' });
  item.workingCount = value.workingCount;
  item.damagedCount = value.damagedCount;
  item.lostCount = value.lostCount;
  await item.save();
  res.json(item);
};

export const transferStock = async (req, res) => {
  const schema = Joi.object({ itemId: Joi.string().required(), fromLabId: Joi.string().required(), toLabId: Joi.string().required(), qty: Joi.number().integer().min(1).required() });
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });

  if (value.fromLabId === value.toLabId) return res.status(400).json({ message: 'fromLabId and toLabId must differ' });

  const source = await Item.findOne({ _id: value.itemId, labId: value.fromLabId });
  if (!source) return res.status(404).json({ message: 'Source item not found' });

  if (source.workingCount < value.qty) return res.status(400).json({ message: 'Insufficient working stock to transfer' });

  // Deduct from source
  source.workingCount -= value.qty;
  source.totalCount -= value.qty;
  await source.save();

  // Find or create same item in destination lab
  let dest = await Item.findOne({ name: source.name, category: source.category, labId: value.toLabId });
  if (!dest) {
    dest = await Item.create({
      name: source.name,
      category: source.category,
      totalCount: value.qty,
      workingCount: value.qty,
      damagedCount: 0,
      lostCount: 0,
      labId: value.toLabId
    });
  } else {
    dest.workingCount += value.qty;
    dest.totalCount += value.qty;
    await dest.save();
  }

  res.json({ message: 'Transfer complete', from: source, to: dest });
};
