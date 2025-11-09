import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    role: { type: String, enum: ['admin', 'lab'], required: true },
    labId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lab' },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true }
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
