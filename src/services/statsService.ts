import { ObjectId } from 'mongodb';
import { db } from '../config/db';

export interface TaskStats {
  total: number;
  byStatus: {
    pending: number;
    in_progress: number;
    completed: number;
  };
  byPriority: {
    low: number;
    medium: number;
    high: number;
  };
  completionRate: number;
  overdue: number;
}

export class StatsService {
  /**
   * Get task statistics for a specific user using MongoDB aggregation pipelines.
   * @param userId The ID of the user
   * @returns Aggregated task statistics
   */
  static async getTaskStats(userId: string): Promise<TaskStats> {
    const userObjectId = new ObjectId(userId);
    const now = new Date();

    // Run all aggregations in parallel
    const [statusCounts, priorityCounts, overdueCount] = await Promise.all([
      // Aggregate by status
      db.tasks
        .aggregate([
          { $match: { userId: userObjectId } },
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ])
        .toArray(),

      // Aggregate by priority
      db.tasks
        .aggregate([
          { $match: { userId: userObjectId } },
          { $group: { _id: '$priority', count: { $sum: 1 } } },
        ])
        .toArray(),

      // Count overdue tasks (dueDate in the past and not completed)
      db.tasks.countDocuments({
        userId: userObjectId,
        status: { $ne: 'completed' },
        dueDate: { $lt: now },
      }),
    ]);

    // Transform status counts
    const byStatus = {
      pending: 0,
      in_progress: 0,
      completed: 0,
    };
    statusCounts.forEach((item) => {
      if (item._id in byStatus) {
        byStatus[item._id as keyof typeof byStatus] = item.count;
      }
    });

    // Transform priority counts
    const byPriority = {
      low: 0,
      medium: 0,
      high: 0,
    };
    priorityCounts.forEach((item) => {
      if (item._id in byPriority) {
        byPriority[item._id as keyof typeof byPriority] = item.count;
      }
    });

    const total = byStatus.pending + byStatus.in_progress + byStatus.completed;
    const completionRate = total > 0 ? Math.round((byStatus.completed / total) * 100) : 0;

    return {
      total,
      byStatus,
      byPriority,
      completionRate,
      overdue: overdueCount,
    };
  }
}
