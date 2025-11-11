import Joi from 'joi';
import Item from '../models/Item.js';
import Lab from '../models/Lab.js';
import ExcelJS from 'exceljs';
import { stringify } from 'csv-stringify';
import { parse as parseCsv } from 'csv-parse/sync';

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

// Export items as CSV or XLSX
export const exportItems = async (req, res) => {
  const format = (req.query.format || 'csv').toLowerCase();
  const filter = {};
  if (req.user.role === 'lab') {
    filter.labId = req.user.labId;
  } else if (req.query.labId) {
    filter.labId = req.query.labId;
  }

  const items = await Item.find(filter).populate('labId', 'name');
  const rows = items.map(it => ({
    name: it.name,
    category: it.category,
    totalCount: it.totalCount,
    workingCount: it.workingCount,
    damagedCount: it.damagedCount,
    lostCount: it.lostCount,
    labId: String(it.labId?._id || it.labId),
    labName: it.labId?.name || ''
  }));

  const dateStr = new Date().toISOString().slice(0,10);
  if (format === 'xlsx') {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Items');
    ws.columns = [
      { header: 'name', key: 'name' },
      { header: 'category', key: 'category' },
      { header: 'totalCount', key: 'totalCount' },
      { header: 'workingCount', key: 'workingCount' },
      { header: 'damagedCount', key: 'damagedCount' },
      { header: 'lostCount', key: 'lostCount' },
      { header: 'labId', key: 'labId' },
      { header: 'labName', key: 'labName' }
    ];
    ws.addRows(rows);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="items-${dateStr}.xlsx"`);
    await wb.xlsx.write(res);
    return res.end();
  }

  // default CSV
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="items-${dateStr}.csv"`);
  const stringifier = stringify({ header: true, columns: ['name','category','totalCount','workingCount','damagedCount','lostCount','labId','labName'] });
  rows.forEach(r => stringifier.write(r));
  stringifier.end();
  stringifier.pipe(res);
};

// Import items from CSV or XLSX (admin only)
export const importItems = async (req, res) => {
  if (!req.file || !req.file.buffer) return res.status(400).json({ message: 'File is required' });

  const filename = req.file.originalname || '';
  const lower = filename.toLowerCase();

  let records = [];
  try {
    if (lower.endsWith('.xlsx')) {
      const wb = new ExcelJS.Workbook();
      await wb.xlsx.load(req.file.buffer);
      const ws = wb.worksheets[0];
      if (!ws) return res.status(400).json({ message: 'No worksheet found' });
      const headers = ws.getRow(1).values.map(v => (typeof v === 'object' && v?.richText ? v.richText.map(rt=>rt.text).join('') : String(v || ''))).slice(1);
      for (let i = 2; i <= ws.rowCount; i++) {
        const row = ws.getRow(i).values.slice(1);
        const rec = {};
        headers.forEach((h, idx) => { rec[h] = row[idx]; });
        records.push(rec);
      }
    } else {
      const text = req.file.buffer.toString('utf8');
      records = parseCsv(text, { columns: true, skip_empty_lines: true });
    }
  } catch (e) {
    return res.status(400).json({ message: 'Failed to parse file' });
  }

  let created = 0, updated = 0;
  const errors = [];

  for (let i = 0; i < records.length; i++) {
    const r = records[i];
    try {
      // Support labId or labName
      let labId = r.labId;
      if (!labId && r.labName) {
        const lab = await Lab.findOne({ name: r.labName });
        if (!lab) throw new Error(`Lab not found: ${r.labName}`);
        labId = String(lab._id);
      }

      const payload = {
        name: String(r.name || '').trim(),
        category: String(r.category || '').trim(),
        totalCount: Number(r.totalCount ?? 0),
        workingCount: Number(r.workingCount ?? 0),
        damagedCount: Number(r.damagedCount ?? 0),
        lostCount: Number(r.lostCount ?? 0),
        labId: String(labId || '').trim()
      };

      const { error, value } = itemSchema.validate(payload);
      if (error) throw new Error(error.message);
      if (value.workingCount + value.damagedCount + value.lostCount !== value.totalCount)
        throw new Error('Counts must add up to totalCount');

      const existing = await Item.findOne({ name: value.name, category: value.category, labId: value.labId });
      if (existing) {
        existing.totalCount = value.totalCount;
        existing.workingCount = value.workingCount;
        existing.damagedCount = value.damagedCount;
        existing.lostCount = value.lostCount;
        await existing.save();
        updated++;
      } else {
        await Item.create(value);
        created++;
      }
    } catch (e) {
      errors.push({ row: i + 2, message: e.message || 'Invalid row' });
    }
  }

  res.json({ created, updated, errors });
};
