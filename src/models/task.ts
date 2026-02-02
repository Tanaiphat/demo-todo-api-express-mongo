import { ObjectId } from 'mongodb';
import { z } from 'zod';

// ============ Enums / Types ============

export const TaskStatus = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
} as const;

export type TaskStatusType = (typeof TaskStatus)[keyof typeof TaskStatus];

export const TaskPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;

export type TaskPriorityType = (typeof TaskPriority)[keyof typeof TaskPriority];

// ============ TypeScript Interfaces ============

export interface Task {
  _id: ObjectId;
  userId: ObjectId;
  title: string;
  description?: string;
  status: TaskStatusType;
  priority: TaskPriorityType;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateTaskInput = Omit<Task, '_id' | 'createdAt' | 'updatedAt'>;
export type UpdateTaskInput = Partial<Omit<Task, '_id' | 'userId' | 'createdAt' | 'updatedAt'>>;

// ============ Zod Schemas ============

export const CreateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(1000).optional(),
  status: z.enum(['pending', 'in_progress', 'completed']).default('pending'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  dueDate: z.coerce.date().optional(),
});

export const UpdateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  status: z.enum(['pending', 'in_progress', 'completed']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  dueDate: z.coerce.date().optional(),
});

// Inferred types from Zod schemas
export type CreateTaskDTO = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskDTO = z.infer<typeof UpdateTaskSchema>;

// ============ Query Options ============

export interface TaskQueryOptions {
  status?: TaskStatusType;
  priority?: TaskPriorityType;
  sortBy?: 'createdAt' | 'updatedAt' | 'dueDate' | 'priority';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export const TaskQuerySchema = z.object({
  status: z.enum(['pending', 'in_progress', 'completed']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'dueDate', 'priority']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});
