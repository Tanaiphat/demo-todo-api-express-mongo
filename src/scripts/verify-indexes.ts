/**
 * Verify Indexes Script
 *
 * Runs explain() on sample queries to verify that the created indexes are being used.
 * Run with: npx tsx src/scripts/verify-indexes.ts
 */

import { MongoClient, ObjectId } from 'mongodb';
import { env } from '../config/env';

async function verifyIndexes() {
  const client = new MongoClient(env.MONGO_URI);

  try {
    await client.connect();
    console.log('🔌 Connected to MongoDB');

    const db = client.db();
    const tasks = db.collection('tasks');

    // Sample userId (doesn't need to exist for explain)
    const userId = new ObjectId();

    console.log('\n🔍 Verifying Index Usage for Tasks Queries:\n');

    // Test 1: Query by userId and status
    console.log('1️⃣  Query: { userId: ..., status: "pending" }');
    const explain1 = await tasks.find({ userId, status: 'pending' }).explain('executionStats');

    // Type assertion for explain result
    const plan1 = explain1 as any;
    const stats1 = plan1.executionStats;
    const stage1 =
      stats1.executionStages.stage === 'FETCH'
        ? stats1.executionStages.inputStage.stage
        : stats1.executionStages.stage;

    console.log(`   - Stage: ${stage1}`);
    console.log(
      `   - Index Used: ${stage1 === 'IXSCAN' ? stats1.executionStages.inputStage.indexName : 'NONE'}`,
    );
    console.log(`   - Documents Examined: ${stats1.totalDocsExamined}`);
    console.log(`   - Keys Examined: ${stats1.totalKeysExamined}`);

    // Test 2: Query by userId and sort by createdAt
    console.log('\n2️⃣  Query: { userId: ... } sort({ createdAt: -1 })');
    const explain2 = await tasks.find({ userId }).sort({ createdAt: -1 }).explain('executionStats');

    const plan2 = explain2 as any;
    const stats2 = plan2.executionStats;
    const stage2 =
      stats2.executionStages.stage === 'FETCH'
        ? stats2.executionStages.inputStage.stage
        : stats2.executionStages.stage;

    console.log(`   - Stage: ${stage2}`);
    console.log(
      `   - Index Used: ${stage2 === 'IXSCAN' ? stats2.executionStages.inputStage.indexName : 'NONE'}`,
    );

    // Test 3: Query by userId and priority
    console.log('\n3️⃣  Query: { userId: ..., priority: "high" }');
    const explain3 = await tasks.find({ userId, priority: 'high' }).explain('executionStats');

    const plan3 = explain3 as any;
    const stats3 = plan3.executionStats;
    const stage3 =
      stats3.executionStages.stage === 'FETCH'
        ? stats3.executionStages.inputStage.stage
        : stats3.executionStages.stage;

    console.log(`   - Stage: ${stage3}`);
    console.log(
      `   - Index Used: ${stage3 === 'IXSCAN' ? stats3.executionStages.inputStage.indexName : 'NONE'}`,
    );
  } catch (error) {
    console.error('❌ Error verifying indexes:', error);
  } finally {
    await client.close();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

verifyIndexes();
