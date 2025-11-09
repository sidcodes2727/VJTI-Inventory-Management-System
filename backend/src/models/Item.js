import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    totalCount: { type: Number, default: 0 },
    workingCount: { type: Number, default: 0 },
    damagedCount: { type: Number, default: 0 },
    lostCount: { type: Number, default: 0 },
    labId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lab', required: true }
  },
  { timestamps: true }
);

itemSchema.index({ labId: 1, name: 1 }, { unique: false });

export default mongoose.model('Item', itemSchema);
