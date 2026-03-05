import 'dotenv/config';   // Must be FIRST — loads .env before anything else
import app from './app';
import { connectDB } from './config/db';
// import { connectRedis } from './config/redis';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to databases first
    await connectDB();
    // await connectRedis();

    // Then start the HTTP server
    app.listen(PORT, () => {
      console.info(`✓ Server running on port ${PORT}`);
      console.info(`✓ Environment: ${process.env.NODE_ENV}`);
      console.info(`✓ Health: http://localhost:${PORT}/api/v1/health`);
    });
  } catch (error) {
    console.error('✗ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: Error) => {
  console.error('Unhandled Rejection:', reason.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error.message);
  process.exit(1);
});

startServer();