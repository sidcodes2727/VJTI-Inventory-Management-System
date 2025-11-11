import Joi from 'joi';
import Complaint from '../models/Complaint.js';

const createSchema = Joi.object({
  title: Joi.string().min(3).required(),
  description: Joi.string().allow(''),
  itemId: Joi.string().optional().allow(''),
  severity: Joi.string().valid('low','medium','high').default('low')
});

export const createComplaint = async (req, res) => {
  const { error, value } = createSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });
  const payload = {
    labId: req.user.labId,
    itemId: value.itemId || undefined,
    title: value.title,
    description: value.description || '',
    severity: value.severity
  };
  const c = await Complaint.create(payload);

  // Notify admins on high severity if SMTP is configured
  if (c.severity === 'high' && process.env.SMTP_HOST && process.env.ALERT_TO) {
    try {
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: false,
        auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined
      });
      const to = process.env.ALERT_TO.split(',').map(s=>s.trim()).filter(Boolean);
      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || 'no-reply@inventory.local',
        to,
        subject: `[High Severity] Complaint: ${c.title}`,
        text: `Severity: ${c.severity}\nTitle: ${c.title}\nDescription: ${c.description}\nComplaint ID: ${c._id}`
      });
      if (process.env.NODE_ENV !== 'production') console.log('Alert email sent', info.messageId);
    } catch (e) {
      if (process.env.NODE_ENV !== 'production') console.warn('Email notify failed', e?.message);
    }
  }
  res.status(201).json(c);
};

export const listMine = async (req, res) => {
  const list = await Complaint.find({ labId: req.user.labId })
    .sort({ createdAt: -1 })
    .populate('itemId', 'name category');
  res.json(list);
};

export const listAll = async (req, res) => {
  const filter = {};
  if (req.query.labId) filter.labId = req.query.labId;
  if (req.query.status) filter.status = req.query.status;
  const list = await Complaint.find(filter)
    .sort({ createdAt: -1 })
    .populate('labId', 'name')
    .populate('itemId', 'name category');
  res.json(list);
};

export const updateStatus = async (req, res) => {
  const schema = Joi.object({ status: Joi.string().valid('open','in_progress','resolved').required(), adminComment: Joi.string().allow('') });
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });
  const c = await Complaint.findById(req.params.id);
  if (!c) return res.status(404).json({ message: 'Complaint not found' });
  c.status = value.status;
  if (typeof value.adminComment === 'string') c.adminComment = value.adminComment;
  await c.save();
  res.json(c);
};

export const addAttachments = async (req, res) => {
  const c = await Complaint.findById(req.params.id);
  if (!c) return res.status(404).json({ message: 'Complaint not found' });
  if (req.user.role === 'lab' && String(c.labId) !== String(req.user.labId))
    return res.status(403).json({ message: 'Forbidden' });
  const files = (req.files || []).map(f => ({ filename: f.filename, url: `/uploads/complaints/${f.filename}`, mime: f.mimetype, size: f.size }));
  c.attachments = [...(c.attachments || []), ...files];
  await c.save();
  res.json({ attachments: c.attachments });
};
