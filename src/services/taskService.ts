import { ObjectId, Sort } from 'mongodb';
import { db } from '../config/db';
import { CreateTaskDTO, Task, TaskQueryOptions, TaskStatus, UpdateTaskDTO } from '../models/task';

export class TaskService {
  /**
   * Creates a new task in the database for a specific user.
   * @param userId The ID of the user creating the task
   * @param data The validated task data
   * @returns The created task
   */
  static async createTask(userId: string, data: CreateTaskDTO): Promise<Task> {
    const now = new Date();
    const taskDoc = {
      userId: new ObjectId(userId),
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.tasks.insertOne(taskDoc);

    return {
      _id: result.insertedId,
      ...taskDoc,
    } as Task;
  }

  /**
   * Retrieves tasks for a specific user with optional filtering, sorting, and pagination.
   * @param userId The ID of the user
   * @param options Query options for filtering, sorting, and pagination
   * @returns An object containing tasks array and pagination metadata
   */
  static async getAllTasks(
    userId: string,
    options: TaskQueryOptions = {},
  ): Promise<{ tasks: Task[]; total: number; page: number; limit: number }> {
    const {
      status,
      priority,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 10,
    } = options;

    // Build filter query
    const filter: Record<string, unknown> = { userId: new ObjectId(userId) };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    // Build sort options
    const sortOrder = order === 'asc' ? 1 : -1;
    const sort: Sort = { [sortBy]: sortOrder };

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Execute queries
    const [tasks, total] = await Promise.all([
      db.tasks.find(filter).sort(sort).skip(skip).limit(limit).toArray(),
      db.tasks.countDocuments(filter),
    ]);

    return {
      tasks: tasks as Task[],
      total,
      page,
      limit,
    };
  }

  /**
   * Retrieves a single task by its ID for a specific user.
   * @param userId The ID of the user
   * @param id The task ID
   * @returns The task or null if not found or not owned by user
   */
  static async getTaskById(userId: string, id: string): Promise<Task | null> {
    const task = await db.tasks.findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(userId),
    });
    return task as Task | null;
  }

  /**
   * Updates a task by its ID for a specific user.
   * @param userId The ID of the user
   * @param id The task ID
   * @param data The update data
   * @returns The updated task or null if not found or not owned by user
   */
  static async updateTask(userId: string, id: string, data: UpdateTaskDTO): Promise<Task | null> {
    const result = await db.tasks.findOneAndUpdate(
      { _id: new ObjectId(id), userId: new ObjectId(userId) },
      { $set: { ...data, updatedAt: new Date() } },
      { returnDocument: 'after' },
    );
    return result as Task | null;
  }

  /**
   * Deletes a task by its ID for a specific user.
   * @param userId The ID of the user
   * @param id The task ID
   * @returns True if deleted, false if not found or not owned by user
   */
  static async deleteTask(userId: string, id: string): Promise<boolean> {
    const result = await db.tasks.deleteOne({
      _id: new ObjectId(id),
      userId: new ObjectId(userId),
    });
    return result.deletedCount === 1;
  }

  /**
   * Toggles the status of a task between pending and completed.
   * @param userId The ID of the user
   * @param id The task ID
   * @returns The updated task or null if not found or not owned by user
   */
  static async toggleTaskStatus(userId: string, id: string): Promise<Task | null> {
    const task = await this.getTaskById(userId, id);
    if (!task) return null;

    const newStatus =
      task.status === TaskStatus.COMPLETED ? TaskStatus.PENDING : TaskStatus.COMPLETED;

    return this.updateTask(userId, id, { status: newStatus });
  }
}
