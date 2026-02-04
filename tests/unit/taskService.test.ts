import { TaskService } from '../../src/services/taskService';
import { db } from '../../src/config/db';
import { ObjectId } from 'mongodb';

// Mock the database module
jest.mock('../../src/config/db', () => ({
  db: {
    tasks: {
      insertOne: jest.fn(),
      find: jest.fn(),
      countDocuments: jest.fn(),
    },
  },
}));

describe('TaskService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTask', () => {
    it('should create a task successfully', async () => {
      const userId = new ObjectId().toString();
      const taskData = {
        title: 'Test Task',
        priority: 'medium' as const,
        status: 'pending' as const,
      };

      const mockId = new ObjectId();
      const mockResult = { insertedId: mockId };

      (db.tasks.insertOne as jest.Mock).mockResolvedValue(mockResult);

      const result = await TaskService.createTask(userId, taskData);

      expect(db.tasks.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: new ObjectId(userId),
          title: 'Test Task',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        }),
      );

      expect(result).toEqual(
        expect.objectContaining({
          _id: mockId,
          title: 'Test Task',
        }),
      );
    });
  });

  describe('getAllTasks', () => {
    it('should return tasks with pagination', async () => {
      const userId = new ObjectId().toString();
      const mockTasks = [
        { _id: new ObjectId(), title: 'Task 1' },
        { _id: new ObjectId(), title: 'Task 2' },
      ];

      const mockChain = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        toArray: jest.fn().mockResolvedValue(mockTasks),
      };

      (db.tasks.find as jest.Mock).mockReturnValue(mockChain);
      (db.tasks.countDocuments as jest.Mock).mockResolvedValue(2);

      const result = await TaskService.getAllTasks(userId);

      expect(db.tasks.find).toHaveBeenCalledWith({ userId: new ObjectId(userId) });
      expect(result.tasks).toHaveLength(2);
      expect(result.tasks[0].title).toBe('Task 1');
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });
  });
});
