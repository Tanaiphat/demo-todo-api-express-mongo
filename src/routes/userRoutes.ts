import { Router } from 'express';
import { UserController } from '../controllers/userController';

const router = Router();

// POST /api/auth/register - Register a new user
router.post('/register', UserController.register);

// POST /api/auth/login - Login a user
router.post('/login', UserController.login);

export default router;
