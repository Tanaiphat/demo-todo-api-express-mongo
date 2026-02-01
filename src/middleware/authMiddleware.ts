import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

interface JWTPayload {
  userId: string;
}

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Authentication middleware that verifies JWT tokens.
 * Extracts userId from the token and attaches it to req.user.
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'No token provided' });
      return;
    }

    const token = authHeader.replace('Bearer ', '');
    const payload = jwt.verify(token, env.JWT_SECRET) as JWTPayload;

    req.user = payload;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};
