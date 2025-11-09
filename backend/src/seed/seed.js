import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db.js';
import Lab from '../models/Lab.js';
import User from '../models/User.js';
import Item from '../models/Item.js';

dotenv.config();

const run = async () => {
  await connectDB();

  await Promise.all([User.deleteMany({}), Lab.deleteMany({}), Item.deleteMany({})]);

  const labs = await Lab.insertMany([
    { name: 'Computer Lab 1', description: 'Main CS Lab' },
    { name: 'Computer Lab 2', description: 'Hardware Lab' }
  ]);

  const adminPassword = await bcrypt.hash('admin123', 10);
  await User.create({ name: 'Admin', role: 'admin', email: 'admin@vjti.ac.in', passwordHash: adminPassword });

  const labUserPassword = await bcrypt.hash('lab12345', 10);
  await User.create({ name: 'Lab Incharge 1', role: 'lab', labId: labs[0]._id, email: 'lab1@vjti.ac.in', passwordHash: labUserPassword });

  await Item.insertMany([
    { name: 'Keyboard', category: 'Input', totalCount: 20, workingCount: 18, damagedCount: 2, lostCount: 0, labId: labs[0]._id },
    { name: 'Mouse', category: 'Input', totalCount: 20, workingCount: 20, damagedCount: 0, lostCount: 0, labId: labs[0]._id },
    { name: 'Monitor', category: 'Display', totalCount: 15, workingCount: 14, damagedCount: 1, lostCount: 0, labId: labs[1]._id }
  ]);

  console.log('Seed completed');
  await mongoose.connection.close();
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
