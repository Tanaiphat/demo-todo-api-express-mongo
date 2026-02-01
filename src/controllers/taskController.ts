import { Request, Response, NextFunction } from 'express';
import { TaskService } from '../services/taskService';
import { CreateTaskSchema, UpdateTaskSchema } from '../models/task';

interface IdParams {
  id: string;
}

export class TaskController {
  /**
   * GET /tasks - Retrieve all tasks for the authenticated user
   */
  static async getTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const tasks = await TaskService.getAllTasks(userId);
      res.status(200).json({ success: true, data: tasks });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /tasks/:id - Retrieve a single task for the authenticated user
   */
  static async getTask(req: Request<IdParams>, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const task = await TaskService.getTaskById(userId, req.params.id);
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
   * POST /tasks - Create a new task for the authenticated user
   */
  static async createTask(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const validatedData = CreateTaskSchema.parse(req.body);
      const task = await TaskService.createTask(userId, validatedData);
      res.status(201).json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /tasks/:id - Update a task for the authenticated user
   */
  static async updateTask(req: Request<IdParams>, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const validatedData = UpdateTaskSchema.parse(req.body);
      const task = await TaskService.updateTask(userId, req.params.id, validatedData);
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
   * DELETE /tasks/:id - Delete a task for the authenticated user
   */
  static async deleteTask(req: Request<IdParams>, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const deleted = await TaskService.deleteTask(userId, req.params.id);
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
   * PATCH /tasks/:id/toggle - Toggle task status for the authenticated user
   */
  static async toggleTaskStatus(req: Request<IdParams>, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const task = await TaskService.toggleTaskStatus(userId, req.params.id);
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
