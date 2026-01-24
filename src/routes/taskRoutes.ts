import { Router } from 'express';
import { TaskController } from '../controllers/taskController';

const router = Router();

// GET /api/tasks - Get all tasks
router.get('/', TaskController.getTasks);

// GET /api/tasks/:id - Get a single task
router.get('/:id', TaskController.getTask);

// POST /api/tasks - Create a new task
router.post('/', TaskController.createTask);

// PUT /api/tasks/:id - Update a task
router.put('/:id', TaskController.updateTask);

// DELETE /api/tasks/:id - Delete a task
router.delete('/:id', TaskController.deleteTask);

// PATCH /api/tasks/:id/toggle - Toggle task status
router.patch('/:id/toggle', TaskController.toggleTaskStatus);

export default router;
