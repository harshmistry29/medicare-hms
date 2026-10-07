import { createApp } from './app';
import { config } from './config/env';
import { db } from './services/dbService';
import { getSeedData } from './data/seedData';

const startServer = async () => {
  try {
    // Attempt MongoDB connection if configured
    if (config.mongodbUri) {
      await db.connectMongo(config.mongodbUri);
    }

    // Auto-seed if database is empty on fresh start
    if (db.getUsers().length === 0) {
      console.log('🌱 Empty database detected on startup. Auto-seeding initial hospital data...');
      const seedData = await getSeedData();
      db.replaceAll(seedData);
      console.log('✅ Initial seed completed successfully!');
    }

    const app = createApp();

    app.listen(config.port, () => {
      console.log(`=======================================================`);
      console.log(`🏥 MediCare HMS Server running at http://localhost:${config.port}`);
      console.log(`📡 API Base: http://localhost:${config.port}/api/v1`);
      console.log(`🩺 Health Check: http://localhost:${config.port}/api/health`);
      console.log(`=======================================================`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
