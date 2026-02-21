import 'dotenv/config';
import mongoose from 'mongoose';
import User from './src/models/User.model';

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI!, { dbName: 'archfirm' });

  const existing = await User.findOne({ email: 'admin@archfirm.com' });
  if (existing) {
    console.info('Admin user already exists');
    process.exit(0);
  }

  await User.create({
    name: 'Site Admin',
    email: 'admin@archfirm.com',
    password: 'ChangeMe123!',  // Change this immediately after first login!
    role: 'superadmin',
  });

  console.info('✓ Admin user created: admin@archfirm.com / ChangeMe123!');
  process.exit(0);
};

seed().catch(console.error);