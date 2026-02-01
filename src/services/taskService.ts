import { ObjectId } from 'mongodb';
import { db } from '../config/db';
import { CreateTaskDTO, Task, TaskStatus, UpdateTaskDTO } from '../models/task';

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
   * Retrieves all tasks for a specific user.
   * @param userId The ID of the user
   * @returns An array of tasks belonging to the user
   */
  static async getAllTasks(userId: string): Promise<Task[]> {
    const tasks = await db.tasks.find({ userId: new ObjectId(userId) }).toArray();
    return tasks as Task[];
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
