import 'dotenv/config';
import mongoose from 'mongoose';
import User from './src/models/User.model';

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI!, { dbName: 'archfirm' });

  const existing = await User.findOne({ email: 'admin@archfirm.com' });
  if (existing) {
    console.info('Admin user already exists');
    await mongoose.disconnect();
    process.exit(0);
  }

  const admin = new User({
    name: 'Site Admin',
    email: 'admin@archfirm.com',
    password: 'ChangeMe123!',
    role: 'superadmin',
  });

  await admin.save();

  console.info('✓ Admin user created: admin@archfirm.com / ChangeMe123!');
  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('✗ Seed failed:', err);
  mongoose.disconnect();
  process.exit(1);
});