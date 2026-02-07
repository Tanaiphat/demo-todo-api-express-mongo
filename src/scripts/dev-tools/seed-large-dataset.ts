/**
 * Seed Large Dataset Script
 *
 * Generates a large number of tasks to test database performance and scalability.
 * Run with: npx tsx src/scripts/seed-large-dataset.ts
 */

import { MongoClient } from 'mongodb';
import { env } from '../../config/env';
import { TaskStatus, TaskPriority } from '../../models/task';
import bcrypt from 'bcrypt';

const TASKS_TO_CREATE = 10000;
const BATCH_SIZE = 1000;

async function seedLargeDataset() {
  const client = new MongoClient(env.MONGO_URI);

  try {
    await client.connect();
    console.log('🔌 Connected to MongoDB');

    const db = client.db();
    const tasksCollection = db.collection('tasks');
    const usersCollection = db.collection('users');

    // Create a dedicated user for scalability testing
    const userEmail = `scale_test_${Date.now()}@example.com`;
    const hashedPassword = await bcrypt.hash('password123!', 10);

    const userResult = await usersCollection.insertOne({
      email: userEmail,
      name: 'Scalability Test User',
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const userId = userResult.insertedId;
    console.log(`👤 Created user: ${userEmail} (ID: ${userId})`);

    console.log(`🚀 Starting generation of ${TASKS_TO_CREATE} tasks...`);
    const startTime = Date.now();

    let tasksCreated = 0;
    while (tasksCreated < TASKS_TO_CREATE) {
      const batch = [];
      const currentBatchSize = Math.min(BATCH_SIZE, TASKS_TO_CREATE - tasksCreated);

      for (let i = 0; i < currentBatchSize; i++) {
        const statuses = Object.values(TaskStatus);
        const priorities = Object.values(TaskPriority);

        batch.push({
          userId: userId,
          title: `Scalability Task ${tasksCreated + i + 1}`,
          description: `This is a generated task for scalability testing. Index: ${tasksCreated + i}`,
          status: statuses[Math.floor(Math.random() * statuses.length)],
          priority: priorities[Math.floor(Math.random() * priorities.length)],
          dueDate: new Date(Date.now() + Math.random() * 10000000000), // Future date
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      await tasksCollection.insertMany(batch);
      tasksCreated += currentBatchSize;
      process.stdout.write(`\r⏳ Created ${tasksCreated}/${TASKS_TO_CREATE} tasks...`);
    }

    const duration = (Date.now() - startTime) / 1000;
    console.log(`\n✅ Successfully created ${TASKS_TO_CREATE} tasks in ${duration.toFixed(2)}s`);
    console.log(`🔑 User ID (for testing): ${userId}`);
    console.log(`📧 User Email: ${userEmail}`);
  } catch (error) {
    console.error('\n❌ Error seeding database:', error);
  } finally {
    await client.close();
    console.log('👋 Disconnected from MongoDB');
  }
}

seedLargeDataset();
