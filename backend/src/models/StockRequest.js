import mongoose from 'mongoose';

const stockRequestSchema = new mongoose.Schema(
  {
    labId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lab', required: true },
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    requestedQty: { type: Number, required: true, min: 1 },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
  },
  { timestamps: true }
);

stockRequestSchema.index({ status: 1, labId: 1 });

export default mongoose.model('StockRequest', stockRequestSchema);
