import { db } from '../config/db';
import { CreateTaskDTO, Task } from '../models/task';

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
}
