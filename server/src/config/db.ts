import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  try {
    const conn = await mongoose.connect(uri, {
      dbName: 'archfirm',
    });

    const { host, port, name } = conn.connection;
    
    // Add temporarily to connectDB after connecting:
    const db = mongoose.connection.db;
    if (db) {
      const dbName = db.databaseName;
      const users = await db.collection('users').find({}).toArray();
      console.log('Connected to DB:', dbName);
      console.log('Users in DB:', JSON.stringify(users, null, 2));
    }

    console.log('\n┌─────────────────────────────────────────┐');
    console.log('│         🗄️  DATABASE CONNECTED            │');
    console.log('├─────────────────────────────────────────┤');
    console.log(`│  Host : ${host.padEnd(31)}│`);
    console.log(`│  Port : ${String(port).padEnd(31)}│`);
    console.log(`│  DB   : ${name.padEnd(31)}│`);
    console.log('└─────────────────────────────────────────┘\n');
  } catch (error) {
    console.error('\n✗ MongoDB connection error:', error);
    throw error;
  }
};

// Graceful disconnect on app shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('\n⚡ MongoDB connection closed gracefully (SIGINT)\n');
  process.exit(0);
});
