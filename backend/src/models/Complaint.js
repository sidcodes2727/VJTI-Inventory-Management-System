import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema(
  {
    labId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lab', required: true },
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    severity: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
    status: { type: String, enum: ['open', 'in_progress', 'resolved'], default: 'open' },
    adminComment: { type: String, default: '' },
    attachments: [{ filename: String, url: String, mime: String, size: Number }]
  },
  { timestamps: true }
);

complaintSchema.index({ labId: 1, status: 1 });

export default mongoose.model('Complaint', complaintSchema);
