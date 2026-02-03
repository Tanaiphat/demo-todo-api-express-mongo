import { Request, Response, NextFunction } from 'express';
import { StatsService } from '../services/statsService';

export class StatsController {
  /**
   * GET /stats - Get task statistics for the authenticated user
   */
  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const stats = await StatsService.getTaskStats(userId);
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }
}
