import { ObjectId } from 'mongodb';
import { db } from '../config/db';
import { CreateTaskDTO, Task, TaskStatus, UpdateTaskDTO } from '../models/task';

export class TaskService {
  /**
   * Creates a new task in the database.
   * @param data The validated task data
   * @returns The created task
   */
  static async createTask(data: CreateTaskDTO): Promise<Task> {
    const now = new Date();
    const taskDocs = {
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.tasks.insertOne(taskDocs);

    return {
      _id: result.insertedId,
      ...taskDocs,
    } as Task;
  }

  /**
   * Retrieves all tasks from the database.
   * @returns An array of tasks
   */
  static async getAllTasks(): Promise<Task[]> {
    const tasks = await db.tasks.find({}).toArray();
    return tasks as Task[];
  }

  /**
   * Retrieves a single task by its ID.
   * @param id The task ID
   * @returns The task or null if not found
   */
  static async getTaskById(id: string): Promise<Task | null> {
    const task = await db.tasks.findOne({ _id: new ObjectId(id) });
    return task as Task | null;
  }

  /**
   * Updates a task by its ID.
   * @param id The task ID
   * @param data The update data
   * @returns The updated task or null if not found
   */
  static async updateTask(id: string, data: UpdateTaskDTO): Promise<Task | null> {
    const result = await db.tasks.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...data, updatedAt: new Date() } },
      { returnDocument: 'after' },
    );
    return result as Task | null;
  }

  /**
   * Deletes a task by its ID.
   * @param id The task ID
   * @returns True if deleted, false if not found
   */
  static async deleteTask(id: string): Promise<boolean> {
    const result = await db.tasks.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount === 1;
  }

  /**
   * Toggles the status of a task between pending and completed.
   * @param id The task ID
   * @returns The updated task or null if not found
   */
  static async toggleTaskStatus(id: string): Promise<Task | null> {
    const task = await this.getTaskById(id);
    if (!task) return null;

    const newStatus =
      task.status === TaskStatus.COMPLETED ? TaskStatus.PENDING : TaskStatus.COMPLETED;

    return this.updateTask(id, { status: newStatus });
  }
}
