import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;

      // Get user from token
      req.user = await User.findById(decoded.userId).select('-password');

      if (!req.user) {
        res.status(401).json({ message: 'Not authorized' });
        return;
      }

      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      res.status(401).json({ message: 'Not authorized' });
      return;
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
    return;
  }
};

// Admin authorization middleware
export const admin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ message: 'Not authorized' });
    return;
  }

  if (req.user.userType !== 'admin') {
    res.status(403).json({ 
      message: 'Admin access required' 
    });
    return;
  }

  next();
};

// Role-based authorization (for backward compatibility)
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    if (!roles.includes(req.user.userType)) {
      res.status(403).json({ 
        message: `User type ${req.user.userType} is not authorized to access this route` 
      });
      return;
    }

    next();
  };
}; 