import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';

dotenv.config();

const run = async () => {
  await connectDB();

  const email = 'admin@vjti.ac.in';
  const password = 'admin123';

  const existing = await User.findOne({ email });
  if (existing) {
    console.log('Admin already exists:', email);
  } else {
    const passwordHash = await bcrypt.hash(password, 10);
    await User.create({ name: 'Admin', role: 'admin', email, passwordHash });
    console.log('Admin user created:', email);
  }

  await mongoose.connection.close();
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
