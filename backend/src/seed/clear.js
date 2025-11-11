import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Lab from '../models/Lab.js';
import User from '../models/User.js';
import Item from '../models/Item.js';
import StockRequest from '../models/StockRequest.js';

dotenv.config();

const run = async () => {
  await connectDB();

  await Promise.all([
    StockRequest.deleteMany({}),
    Item.deleteMany({}),
    Lab.deleteMany({}),
    User.deleteMany({}),
  ]);

  console.log('All collections cleared');
  await mongoose.connection.close();
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
