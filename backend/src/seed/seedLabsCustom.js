import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Lab from '../models/Lab.js';
import Item from '../models/Item.js';
import StockRequest from '../models/StockRequest.js';

dotenv.config();

const LABS = [
  { name: 'LAB 1', description: 'Computer Lab 1' },
  { name: 'LAB 2', description: 'Computer Lab 2' },
  { name: 'LAB 3A', description: 'Computer Lab 3A' },
  { name: 'LAB 3B', description: 'Computer Lab 3B' },
  { name: 'Internet Lab', description: 'Networking-focused Lab' },
];

// Helper to derive working/damaged/lost ensuring they sum to total
const splitCounts = (total, damaged = 1, lost = 0) => {
  const d = Math.min(damaged, Math.max(0, total));
  const l = Math.min(lost, Math.max(0, total - d));
  const w = Math.max(0, total - d - l);
  return { totalCount: total, workingCount: w, damagedCount: d, lostCount: l };
};

// Per-lab inventory definitions (varied counts)
const INVENTORY = {
  'LAB 1': [
    { name: 'Desktop PC', category: 'Compute', ...splitCounts(30, 1, 0) },
    { name: 'Monitor', category: 'Display', ...splitCounts(30, 1, 0) },
    { name: 'Keyboard', category: 'Input', ...splitCounts(32, 1, 0) },
    { name: 'Mouse', category: 'Input', ...splitCounts(32, 1, 0) },
    { name: 'Projector', category: 'Display', ...splitCounts(1, 0, 0) },
    { name: 'Printer', category: 'Peripheral', ...splitCounts(1, 0, 0) },
    { name: 'Scanner', category: 'Peripheral', ...splitCounts(1, 0, 0) },
    { name: 'Router', category: 'Network', ...splitCounts(1, 0, 0) },
    { name: 'Switch', category: 'Network', ...splitCounts(2, 0, 0) },
    { name: 'UPS', category: 'Power', ...splitCounts(4, 0, 0) },
    { name: 'Power Strip', category: 'Power', ...splitCounts(10, 0, 0) },
    { name: 'HDMI Cable', category: 'Accessory', ...splitCounts(8, 0, 0) },
    { name: 'Ethernet Cable', category: 'Accessory', ...splitCounts(16, 1, 0) },
    { name: 'Webcam', category: 'Peripheral', ...splitCounts(4, 0, 0) },
    { name: 'Speakers', category: 'Audio', ...splitCounts(2, 0, 0) },
  ],
  'LAB 2': [
    { name: 'Desktop PC', category: 'Compute', ...splitCounts(24, 1, 0) },
    { name: 'Monitor', category: 'Display', ...splitCounts(24, 1, 0) },
    { name: 'Keyboard', category: 'Input', ...splitCounts(26, 1, 0) },
    { name: 'Mouse', category: 'Input', ...splitCounts(26, 1, 0) },
    { name: 'Projector', category: 'Display', ...splitCounts(1, 0, 0) },
    { name: 'Printer', category: 'Peripheral', ...splitCounts(1, 0, 0) },
    { name: 'Router', category: 'Network', ...splitCounts(1, 0, 0) },
    { name: 'Switch', category: 'Network', ...splitCounts(2, 0, 0) },
    { name: 'UPS', category: 'Power', ...splitCounts(3, 0, 0) },
    { name: 'Power Strip', category: 'Power', ...splitCounts(8, 0, 0) },
    { name: 'HDMI Cable', category: 'Accessory', ...splitCounts(6, 0, 0) },
    { name: 'Ethernet Cable', category: 'Accessory', ...splitCounts(14, 1, 0) },
    { name: 'Webcam', category: 'Peripheral', ...splitCounts(3, 0, 0) },
  ],
  'LAB 3A': [
    { name: 'Desktop PC', category: 'Compute', ...splitCounts(20, 1, 0) },
    { name: 'Monitor', category: 'Display', ...splitCounts(20, 1, 0) },
    { name: 'Keyboard', category: 'Input', ...splitCounts(22, 1, 0) },
    { name: 'Mouse', category: 'Input', ...splitCounts(22, 1, 0) },
    { name: 'Projector', category: 'Display', ...splitCounts(1, 0, 0) },
    { name: 'Switch', category: 'Network', ...splitCounts(2, 0, 0) },
    { name: 'UPS', category: 'Power', ...splitCounts(2, 0, 0) },
    { name: 'Ethernet Cable', category: 'Accessory', ...splitCounts(12, 1, 0) },
  ],
  'LAB 3B': [
    { name: 'Desktop PC', category: 'Compute', ...splitCounts(18, 1, 0) },
    { name: 'Monitor', category: 'Display', ...splitCounts(18, 1, 0) },
    { name: 'Keyboard', category: 'Input', ...splitCounts(20, 1, 0) },
    { name: 'Mouse', category: 'Input', ...splitCounts(20, 1, 0) },
    { name: 'Projector', category: 'Display', ...splitCounts(1, 0, 0) },
    { name: 'Switch', category: 'Network', ...splitCounts(1, 0, 0) },
    { name: 'UPS', category: 'Power', ...splitCounts(2, 0, 0) },
    { name: 'Ethernet Cable', category: 'Accessory', ...splitCounts(10, 0, 0) },
  ],
  'Internet Lab': [
    { name: 'Desktop PC', category: 'Compute', ...splitCounts(16, 1, 0) },
    { name: 'Monitor', category: 'Display', ...splitCounts(16, 1, 0) },
    { name: 'Keyboard', category: 'Input', ...splitCounts(18, 1, 0) },
    { name: 'Mouse', category: 'Input', ...splitCounts(18, 1, 0) },
    { name: 'Projector', category: 'Display', ...splitCounts(1, 0, 0) },
    { name: 'Printer', category: 'Peripheral', ...splitCounts(1, 0, 0) },
    { name: 'Router', category: 'Network', ...splitCounts(4, 0, 0) },
    { name: 'Switch', category: 'Network', ...splitCounts(6, 0, 0) },
    { name: 'UPS', category: 'Power', ...splitCounts(3, 0, 0) },
    { name: 'Power Strip', category: 'Power', ...splitCounts(8, 0, 0) },
    { name: 'HDMI Cable', category: 'Accessory', ...splitCounts(8, 0, 0) },
    { name: 'Ethernet Cable', category: 'Accessory', ...splitCounts(24, 2, 0) },
    { name: 'Webcam', category: 'Peripheral', ...splitCounts(4, 0, 0) },
    { name: 'Speakers', category: 'Audio', ...splitCounts(2, 0, 0) },
  ],
};

const run = async () => {
  await connectDB();

  // Clear inventory-related collections (keep users)
  await Promise.all([
    StockRequest.deleteMany({}),
    Item.deleteMany({}),
    Lab.deleteMany({}),
  ]);

  // Insert labs
  const labDocs = await Lab.insertMany(LABS);
  const labIdByName = Object.fromEntries(labDocs.map(l => [l.name, l._id]));

  // Build items for each lab with varied counts
  const items = [];
  for (const lab of LABS) {
    const defs = INVENTORY[lab.name] || [];
    for (const it of defs) {
      items.push({ ...it, labId: labIdByName[lab.name] });
    }
  }

  if (items.length) {
    await Item.insertMany(items);
  }

  console.log('Seeded specified labs with varied inventory counts');
  await mongoose.connection.close();
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
