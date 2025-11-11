import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Lab from '../models/Lab.js';
import Item from '../models/Item.js';
import StockRequest from '../models/StockRequest.js';

dotenv.config();

const LAB_NAMES = [
  { name: 'Computer Lab 1', description: 'Main CS Lab' },
  { name: 'Computer Lab 2', description: 'Systems Lab' },
  { name: 'AI Lab', description: 'ML/AI Research' },
  { name: 'Electronics Lab', description: 'Circuits and Devices' },
  { name: 'Networking Lab', description: 'Networks & Security' },
];

// Standard computer lab inventory with categories and suggested counts
const STANDARD_ITEMS = [
  { name: 'Desktop PC', category: 'Compute', total: 25, working: 24, damaged: 1, lost: 0 },
  { name: 'Monitor', category: 'Display', total: 25, working: 24, damaged: 1, lost: 0 },
  { name: 'Keyboard', category: 'Input', total: 26, working: 25, damaged: 1, lost: 0 },
  { name: 'Mouse', category: 'Input', total: 26, working: 25, damaged: 1, lost: 0 },
  { name: 'Projector', category: 'Display', total: 2, working: 2, damaged: 0, lost: 0 },
  { name: 'Printer', category: 'Peripheral', total: 2, working: 2, damaged: 0, lost: 0 },
  { name: 'Scanner', category: 'Peripheral', total: 1, working: 1, damaged: 0, lost: 0 },
  { name: 'Router', category: 'Network', total: 2, working: 2, damaged: 0, lost: 0 },
  { name: 'Switch', category: 'Network', total: 3, working: 3, damaged: 0, lost: 0 },
  { name: 'UPS', category: 'Power', total: 5, working: 5, damaged: 0, lost: 0 },
  { name: 'Power Strip', category: 'Power', total: 12, working: 12, damaged: 0, lost: 0 },
  { name: 'HDMI Cable', category: 'Accessory', total: 10, working: 10, damaged: 0, lost: 0 },
  { name: 'Ethernet Cable', category: 'Accessory', total: 20, working: 19, damaged: 1, lost: 0 },
  { name: 'Webcam', category: 'Peripheral', total: 6, working: 6, damaged: 0, lost: 0 },
  { name: 'Speakers', category: 'Audio', total: 4, working: 4, damaged: 0, lost: 0 },
];

const run = async () => {
  await connectDB();

  // Do not touch users; clear inventory-related collections
  await Promise.all([
    StockRequest.deleteMany({}),
    Item.deleteMany({}),
    Lab.deleteMany({}),
  ]);

  // Create labs
  const labs = await Lab.insertMany(LAB_NAMES);

  // Create standard items for each lab
  const itemsToInsert = [];
  for (const lab of labs) {
    for (const it of STANDARD_ITEMS) {
      itemsToInsert.push({
        name: it.name,
        category: it.category,
        totalCount: it.total,
        workingCount: it.working,
        damagedCount: it.damaged,
        lostCount: it.lost,
        labId: lab._id,
      });
    }
  }

  await Item.insertMany(itemsToInsert);

  console.log('Seeded labs and standard computer lab inventory');
  await mongoose.connection.close();
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
