import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/userService';
import { RegisterSchema, LoginSchema } from '../models/user';

export class UserController {
  /**
   * POST /api/auth/register - Register a new user
   */
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = RegisterSchema.parse(req.body);
      const user = await UserService.register(validatedData);
      res.status(201).json({ success: true, data: user });
    } catch (error) {
      if (error instanceof Error && error.message === 'User with this email already exists') {
        res.status(409).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  }

  /**
   * POST /api/auth/login - Login a user
   */
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = LoginSchema.parse(req.body);
      const result = await UserService.login(validatedData.email, validatedData.password);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      if (error instanceof Error && error.message === 'Invalid credentials') {
        res.status(401).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  }
}
