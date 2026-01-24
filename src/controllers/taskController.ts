import { Request, Response, NextFunction } from 'express';
import { TaskService } from '../services/taskService';
import { CreateTaskSchema } from '../models/task';

export class TaskController {
  /**
   * GET /tasks - Retrieve all tasks
   */
  static async getTasks(_req: Request, res: Response, next: NextFunction) {
    try {
      const tasks = await TaskService.getAllTasks();
      res.status(200).json({ success: true, data: tasks });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /tasks - Create a new task
   */
  static async createTask(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = CreateTaskSchema.parse(req.body);
      const task = await TaskService.createTask(validatedData);
      res.status(201).json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  }
}
