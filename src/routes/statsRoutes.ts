import { Router } from 'express';
import { StatsController } from '../controllers/statsController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

// GET /api/stats - Get task statistics
router.get('/', StatsController.getStats);

export default router;
