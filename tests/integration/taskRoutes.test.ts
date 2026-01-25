import request from 'supertest';
import { app } from '../../src/app';
import { setupTestDb, teardownTestDb } from '../setup';
import { TaskStatus, TaskPriority } from '../../src/models/task';

beforeAll(async () => {
  await setupTestDb();
});

afterAll(async () => {
  await teardownTestDb();
});

describe('Task Routes Integration', () => {
  let createdTaskId: string;

  describe('POST /api/tasks', () => {
    it('should create a new task successfully', async () => {
      const res = await request(app).post('/api/tasks').send({
        title: 'Integration Test Task',
        description: 'Testing the API flow',
        priority: TaskPriority.HIGH,
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data.title).toBe('Integration Test Task');
      expect(res.body.data.status).toBe(TaskStatus.PENDING); // Default

      createdTaskId = res.body.data._id;
    });

    it('should return 400 for invalid input', async () => {
      const res = await request(app).post('/api/tasks').send({
        description: 'Missing title',
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Validation error');
    });
  });

  describe('GET /api/tasks', () => {
    it('should return all tasks', async () => {
      const res = await request(app).get('/api/tasks');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/tasks/:id', () => {
    it('should return a task by ID', async () => {
      const res = await request(app).get(`/api/tasks/${createdTaskId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(createdTaskId);
    });

    it('should return 404 for non-existent ID', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app).get(`/api/tasks/${fakeId}`);

      expect(res.status).toBe(404);
    });

    it('should return 400 for invalid ID format', async () => {
      const res = await request(app).get('/api/tasks/invalid-id');

      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should update a task', async () => {
      const res = await request(app).put(`/api/tasks/${createdTaskId}`).send({
        title: 'Updated Title',
        status: TaskStatus.IN_PROGRESS,
      });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Updated Title');
      expect(res.body.data.status).toBe(TaskStatus.IN_PROGRESS);
    });
  });

  describe('PATCH /api/tasks/:id/toggle', () => {
    it('should toggle task status', async () => {
      // Currently IN_PROGRESS, toggle should ideally switch to COMPLETED if it was PENDING?
      // Logic: if COMPLETED -> PENDING, else -> COMPLETED.
      // So IN_PROGRESS -> COMPLETED.

      const res = await request(app).patch(`/api/tasks/${createdTaskId}/toggle`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe(TaskStatus.COMPLETED);

      // Toggle again: COMPLETED -> PENDING
      const res2 = await request(app).patch(`/api/tasks/${createdTaskId}/toggle`);
      expect(res2.body.data.status).toBe(TaskStatus.PENDING);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete a task', async () => {
      const res = await request(app).delete(`/api/tasks/${createdTaskId}`);

      expect(res.status).toBe(204);

      // Verify it's gone
      const check = await request(app).get(`/api/tasks/${createdTaskId}`);
      expect(check.status).toBe(404);
    });
  });
});
