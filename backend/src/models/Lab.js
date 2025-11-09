import mongoose from 'mongoose';

const labSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, index: true },
    description: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model('Lab', labSchema);
