import { Router } from 'express';
import { TaskController } from '../controllers/taskController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// All task routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Retrieve all tasks
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in_progress, completed]
 *         description: Filter by task status
 *     responses:
 *       200:
 *         description: List of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Task'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 */
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
