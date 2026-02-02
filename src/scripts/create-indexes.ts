/**
 * Database Indexing Script
 *
 * Creates indexes on MongoDB collections to optimize query performance.
 * Run with: npx tsx src/scripts/create-indexes.ts
 */

import { MongoClient } from 'mongodb';
import { env } from '../config/env';

async function createIndexes() {
  const client = new MongoClient(env.MONGO_URI);

  try {
    await client.connect();
    console.log('🔌 Connected to MongoDB');

    const db = client.db();

    // ============ Tasks Collection Indexes ============
    const tasks = db.collection('tasks');

    // Compound index for user-scoped queries with status filtering
    await tasks.createIndex({ userId: 1, status: 1 }, { name: 'idx_userId_status' });

    // Compound index for user-scoped queries with priority filtering
    await tasks.createIndex({ userId: 1, priority: 1 }, { name: 'idx_userId_priority' });

    // Compound index for user-scoped queries sorted by createdAt
    await tasks.createIndex({ userId: 1, createdAt: -1 }, { name: 'idx_userId_createdAt' });

    // Compound index for user-scoped queries sorted by dueDate
    await tasks.createIndex({ userId: 1, dueDate: 1 }, { name: 'idx_userId_dueDate' });

    console.log('✅ Tasks collection indexes created');

    // ============ Users Collection Indexes ============
    const users = db.collection('users');

    // Unique index on email for fast lookups and constraint
    await users.createIndex({ email: 1 }, { name: 'idx_email', unique: true });

    console.log('✅ Users collection indexes created');

    // List all indexes
    console.log('\n📋 Current indexes on tasks:');
    const taskIndexes = await tasks.indexes();
    taskIndexes.forEach((idx) => console.log(`   - ${idx.name}: ${JSON.stringify(idx.key)}`));

    console.log('\n📋 Current indexes on users:');
    const userIndexes = await users.indexes();
    userIndexes.forEach((idx) => console.log(`   - ${idx.name}: ${JSON.stringify(idx.key)}`));

    console.log('\n🎉 All indexes created successfully!');
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('👋 Disconnected from MongoDB');
  }
}

createIndexes();
