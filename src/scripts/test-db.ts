import { db } from '../config/db';

async function testConnection() {
  try {
    console.log('🔄 Attempting to connect to MongoDB...');
    await db.connect();

    const database = db.getDb();
    const ping = await database.command({ ping: 1 });

    if (ping.ok) {
      console.log('✅ Database ping successful!');
    }

    const collections = await database.listCollections().toArray();
    console.log(
      '📂 Found collections:',
      collections.map((c) => c.name),
    );
  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    console.log('👋 Closing connection...');
    await db.getClient().close();
    process.exit(0);
  }
}

testConnection();
