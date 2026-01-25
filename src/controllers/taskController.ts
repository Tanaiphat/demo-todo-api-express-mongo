import { Request, Response, NextFunction } from 'express';

interface IdParams {
  id: string;
}
import { TaskService } from '../services/taskService';
import { CreateTaskSchema, UpdateTaskSchema } from '../models/task';

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
   * GET /tasks/:id - Retrieve a single task
   */
  static async getTask(req: Request<IdParams>, res: Response, next: NextFunction) {
    try {
      const task = await TaskService.getTaskById(req.params.id);
      if (!task) {
        res.status(404).json({ success: false, message: 'Task not found' });
        return;
      }
      res.status(200).json({ success: true, data: task });
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

  /**
   * PUT /tasks/:id - Update a task
   */
  static async updateTask(req: Request<IdParams>, res: Response, next: NextFunction) {
    try {
      const validatedData = UpdateTaskSchema.parse(req.body);
      const task = await TaskService.updateTask(req.params.id, validatedData);
      if (!task) {
        res.status(404).json({ success: false, message: 'Task not found' });
        return;
      }
      res.status(200).json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /tasks/:id - Delete a task
   */
  static async deleteTask(req: Request<IdParams>, res: Response, next: NextFunction) {
    try {
      const deleted = await TaskService.deleteTask(req.params.id);
      if (!deleted) {
        res.status(404).json({ success: false, message: 'Task not found' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /tasks/:id/toggle - Toggle task status
   */
  static async toggleTaskStatus(req: Request<IdParams>, res: Response, next: NextFunction) {
    try {
      const task = await TaskService.toggleTaskStatus(req.params.id);
      if (!task) {
        res.status(404).json({ success: false, message: 'Task not found' });
        return;
      }
      res.status(200).json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  }
}
