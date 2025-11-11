import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db.js';
import Lab from '../models/Lab.js';
import User from '../models/User.js';
import Item from '../models/Item.js';
import MaintenanceRecord from '../models/MaintenanceRecord.js';

dotenv.config();

const run = async () => {
  await connectDB();

  await Promise.all([User.deleteMany({}), Lab.deleteMany({}), Item.deleteMany({}), MaintenanceRecord.deleteMany({})]);

  const labs = await Lab.insertMany([
    { name: 'Computer Lab 1', description: 'Main CS Lab' },
    { name: 'Computer Lab 2', description: 'Hardware Lab' },
    { name: 'Electronics Lab', description: 'Circuits and IoT' },
    { name: 'AI Lab', description: 'ML/AI Research' }
  ]);

  const adminPassword = await bcrypt.hash('admin123', 10);
  await User.create({ name: 'Admin', role: 'admin', email: 'admin@vjti.ac.in', passwordHash: adminPassword });

  const labUserPassword = await bcrypt.hash('lab12345', 10);
  await User.create({ name: 'Lab Incharge 1', role: 'lab', labId: labs[0]._id, email: 'lab1@vjti.ac.in', passwordHash: labUserPassword });

  const categories = ['Input', 'Display', 'Compute', 'Network', 'Peripheral', 'Storage'];
  const itemsCatalog = [
    'Keyboard','Mouse','Monitor','CPU Tower','Laptop','Router','Switch','Printer','Scanner','Webcam','Projector','Microcontroller Kit','Oscilloscope','Multimeter','Speaker','Headset','SSD','HDD','RAM Module','GPU','NIC Card','UPS','Power Strip','HDMI Cable','Ethernet Cable','Arduino Kit','Raspberry Pi','Soldering Station','Breadboard Kit','Lab Bench PC'
  ];
  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  const itemsToInsert = [];
  for (const lab of labs) {
    // pick a subset per lab
    const shuffled = [...itemsCatalog].sort(() => Math.random() - 0.5).slice(0, rand(10, 18));
    for (const name of shuffled) {
      const total = rand(5, 40);
      const damaged = rand(0, Math.min(5, total));
      const lost = rand(0, Math.min(2, total - damaged));
      const working = Math.max(0, total - damaged - lost);
      const category = categories[rand(0, categories.length - 1)];
      itemsToInsert.push({ name, category, totalCount: total, workingCount: working, damagedCount: damaged, lostCount: lost, labId: lab._id });
    }
  }

  await Item.insertMany(itemsToInsert);

  const allItems = await Item.find({});
  const types = ['repair','calibration','service','replacement','other'];
  const now = new Date();
  const recs = [];
  for (const it of allItems) {
    const n = rand(2, 8);
    for (let i = 0; i < n; i++) {
      const monthsAgo = rand(0, 11);
      const d = new Date(now);
      d.setMonth(d.getMonth() - monthsAgo);
      d.setDate(rand(1, 28));
      recs.push({
        labId: it.labId,
        itemId: it._id,
        date: d,
        cost: Math.round((rand(200, 5000) + Math.random()) * 100) / 100,
        type: types[rand(0, types.length - 1)],
        vendor: 'Sample Vendor',
        notes: 'Auto generated'
      });
    }
  }
  if (recs.length) await MaintenanceRecord.insertMany(recs);

  console.log('Seed completed');
  await mongoose.connection.close();
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
