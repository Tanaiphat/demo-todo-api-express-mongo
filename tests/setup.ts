import { db } from '../src/config/db';

export const setupTestDb = async () => {
  // Ensure we are in a test environment to avoid dropping prod DB
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('NODE_ENV must be "test" to run integration tests.');
  }

  // Connect to the database
  await db.connect();

  // Clear all collections
  const collections = await db.tasks.db.collections();
  for (const collection of collections) {
    await collection.deleteMany({});
  }
};

export const teardownTestDb = async () => {
  // Check if connected before closing because some tests might fail early
  await db.disconnect();
};
