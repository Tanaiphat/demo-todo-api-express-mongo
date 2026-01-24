import { TaskService } from '../../src/services/taskService';
import { db } from '../../src/config/db';
import { ObjectId } from 'mongodb';

// Mock the database module
jest.mock('../../src/config/db', () => ({
  db: {
    tasks: {
      insertOne: jest.fn(),
      find: jest.fn(),
    },
  },
}));

describe('TaskService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTask', () => {
    it('should create a task successfully', async () => {
      const taskData = {
        title: 'Test Task',
        priority: 'medium' as const,
        status: 'pending' as const,
      };

      const mockId = new ObjectId();
      const mockResult = { insertedId: mockId };

      (db.tasks.insertOne as jest.Mock).mockResolvedValue(mockResult);

      const result = await TaskService.createTask(taskData);

      expect(db.tasks.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
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
    it('should return an array of tasks', async () => {
      const mockTasks = [
        { _id: new ObjectId(), title: 'Task 1' },
        { _id: new ObjectId(), title: 'Task 2' },
      ];

      (db.tasks.find as jest.Mock).mockReturnValue({
        toArray: jest.fn().mockResolvedValue(mockTasks),
      });

      const result = await TaskService.getAllTasks();

      expect(db.tasks.find).toHaveBeenCalledWith({});
      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Task 1');
    });
  });
});
