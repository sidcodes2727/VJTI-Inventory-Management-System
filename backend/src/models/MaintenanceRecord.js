import mongoose from 'mongoose';

const maintenanceRecordSchema = new mongoose.Schema(
  {
    labId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lab', required: true },
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    date: { type: Date, required: true },
    cost: { type: Number, required: true, min: 0 },
    type: { type: String, enum: ['repair','calibration','service','replacement','other'], default: 'repair' },
    vendor: { type: String, default: '' },
    notes: { type: String, default: '' },
    complaintId: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint' }
  },
  { timestamps: true }
);

maintenanceRecordSchema.index({ labId: 1, date: 1 });
maintenanceRecordSchema.index({ itemId: 1, date: 1 });

export default mongoose.model('MaintenanceRecord', maintenanceRecordSchema);
