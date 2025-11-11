import Joi from 'joi';
import MaintenanceRecord from '../models/MaintenanceRecord.js';
import Item from '../models/Item.js';

const createSchema = Joi.object({
  itemId: Joi.string().required(),
  date: Joi.date().required(),
  cost: Joi.number().min(0).required(),
  type: Joi.string().valid('repair','calibration','service','replacement','other').default('repair'),
  vendor: Joi.string().allow(''),
  notes: Joi.string().allow(''),
  complaintId: Joi.string().optional().allow('')
});

export const createRecord = async (req, res) => {
  const { error, value } = createSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });
  const item = await Item.findById(value.itemId);
  if (!item) return res.status(404).json({ message: 'Item not found' });
  if (req.user.role === 'lab' && String(item.labId) !== String(req.user.labId))
    return res.status(403).json({ message: 'Forbidden' });
  const payload = {
    labId: req.user.role === 'admin' ? item.labId : req.user.labId,
    itemId: item._id,
    date: new Date(value.date),
    cost: value.cost,
    type: value.type,
    vendor: value.vendor || '',
    notes: value.notes || '',
    complaintId: value.complaintId || undefined
  };
  const rec = await MaintenanceRecord.create(payload);
  res.status(201).json(rec);
};

export const listRecords = async (req, res) => {
  const { start, end, labId, itemId, type } = req.query;
  const filter = {};
  if (req.user.role === 'lab') filter.labId = req.user.labId; else if (labId) filter.labId = labId;
  if (itemId) filter.itemId = itemId;
  if (type) filter.type = type;
  if (start || end) {
    filter.date = {};
    if (start) filter.date.$gte = new Date(start);
    if (end) filter.date.$lte = new Date(end);
  }
  const list = await MaintenanceRecord.find(filter)
    .sort({ date: -1 })
    .populate('itemId', 'name category')
    .populate('labId', 'name');
  res.json(list);
};

export const summary = async (req, res) => {
  const { start, end, labId, limit = 10 } = req.query;
  const match = {};
  if (req.user.role === 'lab') match.labId = req.user.labId; else if (labId) match.labId = new (await import('mongoose')).default.Types.ObjectId(labId);
  if (start || end) {
    match.date = {};
    if (start) match.date.$gte = new Date(start);
    if (end) match.date.$lte = new Date(end);
  }

  // monthly cost trend
  const monthlyCost = await MaintenanceRecord.aggregate([
    { $match: match },
    { $group: { _id: { y: { $year: '$date' }, m: { $month: '$date' } }, total: { $sum: '$cost' } } },
    { $sort: { '_id.y': 1, '_id.m': 1 } }
  ]);

  // by type
  const byType = await MaintenanceRecord.aggregate([
    { $match: match },
    { $group: { _id: '$type', total: { $sum: '$cost' } } },
    { $sort: { total: -1 } }
  ]);

  // by lab (admin only)
  let byLab = [];
  if (req.user.role === 'admin') {
    byLab = await MaintenanceRecord.aggregate([
      { $match: match },
      { $group: { _id: '$labId', total: { $sum: '$cost' } } },
      { $sort: { total: -1 } },
      { $limit: 20 }
    ]);
  }

  // by category and top items require item lookup
  const byCategory = await MaintenanceRecord.aggregate([
    { $match: match },
    { $lookup: { from: 'items', localField: 'itemId', foreignField: '_id', as: 'item' } },
    { $unwind: '$item' },
    { $group: { _id: '$item.category', total: { $sum: '$cost' } } },
    { $sort: { total: -1 } }
  ]);

  const topItems = await MaintenanceRecord.aggregate([
    { $match: match },
    { $group: { _id: '$itemId', total: { $sum: '$cost' } } },
    { $sort: { total: -1 } },
    { $limit: Number(limit) },
    { $lookup: { from: 'items', localField: '_id', foreignField: '_id', as: 'item' } },
    { $unwind: '$item' },
    { $project: { _id: 1, total: 1, name: '$item.name', category: '$item.category' } }
  ]);

  res.json({ monthlyCost, byType, byLab, byCategory, topItems });
};

export const templateCsv = async (req, res) => {
  const header = 'date,itemId,cost,type,vendor,notes\n';
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="maintenance-template.csv"');
  res.send(header);
};

export const importCsv = async (req, res) => {
  if (!req.file || !req.file.buffer) return res.status(400).json({ message: 'File is required' });
  let records = [];
  try {
    const text = req.file.buffer.toString('utf8');
    // naive CSV parse expecting header: date,itemId,cost,type,vendor,notes
    const lines = text.split(/\r?\n/).filter(Boolean);
    const header = (lines.shift() || '').split(',').map(h=>h.trim());
    const idx = (name) => header.indexOf(name);
    if (idx('date') === -1 || idx('itemId') === -1 || idx('cost') === -1) throw new Error('Missing required headers');
    for (const line of lines) {
      const cols = line.split(',');
      records.push({
        date: cols[idx('date')]?.trim(),
        itemId: cols[idx('itemId')]?.trim(),
        cost: cols[idx('cost')]?.trim(),
        type: (cols[idx('type')]||'').trim(),
        vendor: (cols[idx('vendor')]||'').trim(),
        notes: (cols[idx('notes')]||'').trim(),
      });
    }
  } catch (e) {
    return res.status(400).json({ message: 'Failed to parse CSV' });
  }

  let created = 0;
  const errors = [];
  for (let i = 0; i < records.length; i++) {
    const r = records[i];
    try {
      const item = await Item.findById(r.itemId);
      if (!item) throw new Error('Item not found');
      if (req.user.role === 'lab' && String(item.labId) !== String(req.user.labId))
        throw new Error('Forbidden for this item');
      const payload = {
        labId: req.user.role === 'admin' ? item.labId : req.user.labId,
        itemId: item._id,
        date: new Date(r.date),
        cost: Number(r.cost),
        type: r.type || 'repair',
        vendor: r.vendor || '',
        notes: r.notes || ''
      };
      const { error } = createSchema.validate({ ...payload, complaintId: '' });
      if (error) throw new Error(error.message);
      await MaintenanceRecord.create(payload);
      created++;
    } catch (e) {
      errors.push({ row: i + 2, message: e.message || 'Invalid row' });
    }
  }
  res.json({ created, errors });
};
