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
  let authToken: string;

  beforeAll(async () => {
    // Register and login a user to get a token
    const testUser = {
      email: 'tasktest@example.com',
      password: 'password123',
      name: 'Task Tester',
    };

    await request(app).post('/api/auth/register').send(testUser);
    const loginRes = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    });
    authToken = `Bearer ${loginRes.body.data.token}`;
  });

  describe('POST /api/tasks', () => {
    it('should create a new task successfully', async () => {
      const res = await request(app).post('/api/tasks').set('Authorization', authToken).send({
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

    it('should return 401 if no token provided', async () => {
      const res = await request(app).post('/api/tasks').send({
        title: 'Unauthorized Task',
      });
      expect(res.status).toBe(401);
    });

    it('should return 400 for invalid input', async () => {
      const res = await request(app).post('/api/tasks').set('Authorization', authToken).send({
        description: 'Missing title',
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Validation error');
    });
  });

  describe('GET /api/tasks', () => {
    it('should return all tasks for the user', async () => {
      const res = await request(app).get('/api/tasks').set('Authorization', authToken);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/tasks/:id', () => {
    it('should return a task by ID', async () => {
      const res = await request(app)
        .get(`/api/tasks/${createdTaskId}`)
        .set('Authorization', authToken);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(createdTaskId);
    });

    it('should return 404 for non-existent ID', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app).get(`/api/tasks/${fakeId}`).set('Authorization', authToken);

      expect(res.status).toBe(404);
    });

    it('should return 400 for invalid ID format', async () => {
      const res = await request(app).get('/api/tasks/invalid-id').set('Authorization', authToken);

      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should update a task', async () => {
      const res = await request(app)
        .put(`/api/tasks/${createdTaskId}`)
        .set('Authorization', authToken)
        .send({
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
      const res = await request(app)
        .patch(`/api/tasks/${createdTaskId}/toggle`)
        .set('Authorization', authToken);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe(TaskStatus.COMPLETED);

      // Toggle again: COMPLETED -> PENDING
      const res2 = await request(app)
        .patch(`/api/tasks/${createdTaskId}/toggle`)
        .set('Authorization', authToken);
      expect(res2.body.data.status).toBe(TaskStatus.PENDING);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete a task', async () => {
      const res = await request(app)
        .delete(`/api/tasks/${createdTaskId}`)
        .set('Authorization', authToken);

      expect(res.status).toBe(204);

      // Verify it's gone
      const check = await request(app)
        .get(`/api/tasks/${createdTaskId}`)
        .set('Authorization', authToken);
      expect(check.status).toBe(404);
    });
  });

  describe('User Scoping / Isolation', () => {
    let userBToken: string;

    beforeAll(async () => {
      // Create User B
      const userB = {
        email: 'userb@example.com',
        password: 'password123',
        name: 'User B',
      };
      await request(app).post('/api/auth/register').send(userB);
      const loginRes = await request(app).post('/api/auth/login').send({
        email: userB.email,
        password: userB.password,
      });
      userBToken = `Bearer ${loginRes.body.data.token}`;
    });

    it("User B should NOT see User A's tasks", async () => {
      const res = await request(app).get('/api/tasks').set('Authorization', userBToken);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      // Ensure the task created by User A (createdTaskId) is not in User B's list
      const found = res.body.data.find((t: any) => t._id === createdTaskId);
      expect(found).toBeUndefined();
    });

    it("User B should NOT be able to access User A's task by ID", async () => {
      const res = await request(app)
        .get(`/api/tasks/${createdTaskId}`)
        .set('Authorization', userBToken);

      expect(res.status).toBe(404); // Should return 404 (Not Found) effectively hiding existence
    });

    it("User B should NOT be able to update User A's task", async () => {
      const res = await request(app)
        .put(`/api/tasks/${createdTaskId}`)
        .set('Authorization', userBToken)
        .send({ title: 'Hacked Title' });

      expect(res.status).toBe(404);
    });

    it("User B should NOT be able to delete User A's task", async () => {
      const res = await request(app)
        .delete(`/api/tasks/${createdTaskId}`)
        .set('Authorization', userBToken);

      expect(res.status).toBe(404);
    });
  });
});
