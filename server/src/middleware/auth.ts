import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { db } from '../services/dbService';
import { UserRole } from '../types';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    name: string;
    doctorProfileId?: string;
    patientProfileId?: string;
    departmentId?: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'Authentication required. No authorization token provided.',
    });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as {
      id: string;
      email: string;
      role: UserRole;
      name: string;
      doctorProfileId?: string;
      patientProfileId?: string;
      departmentId?: string;
    };

    const user = db.getUserById(decoded.id);
    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: 'User account not found or is deactivated.',
      });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      doctorProfileId: user.doctorProfileId,
      patientProfileId: user.patientProfileId,
      departmentId: user.departmentId,
    };

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired session token.',
    });
  }
};
