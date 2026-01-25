import { CreateTaskSchema, UpdateTaskSchema } from '../models/task';

console.log('🧪 Testing Zod Schemas...\n');

// Test CreateTaskSchema - Valid
console.log('--- CreateTaskSchema (Valid) ---');
const validCreate = CreateTaskSchema.parse({
  title: 'Complete project documentation',
  description: 'Write comprehensive docs for the API',
  priority: 'high',
});
console.log('✅ Valid create:', validCreate);

// Test CreateTaskSchema - With defaults
console.log('\n--- CreateTaskSchema (With Defaults) ---');
const withDefaults = CreateTaskSchema.parse({
  title: 'Simple task',
});
console.log('✅ With defaults:', withDefaults);

// Test CreateTaskSchema - Invalid (missing title)
console.log('\n--- CreateTaskSchema (Invalid - Missing Title) ---');
try {
  CreateTaskSchema.parse({});
} catch (error) {
  if (error instanceof Error) {
    console.log('❌ Expected error:', error.message);
  }
}

// Test UpdateTaskSchema - Partial update
console.log('\n--- UpdateTaskSchema (Partial Update) ---');
const partialUpdate = UpdateTaskSchema.parse({
  status: 'completed',
});
console.log('✅ Partial update:', partialUpdate);

// Test UpdateTaskSchema - Empty (all optional)
console.log('\n--- UpdateTaskSchema (Empty) ---');
const emptyUpdate = UpdateTaskSchema.parse({});
console.log('✅ Empty update (valid):', emptyUpdate);

console.log('\n🎉 All schema tests completed!');
