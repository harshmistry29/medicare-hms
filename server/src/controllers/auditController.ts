import { Response, NextFunction } from 'express';
import { db } from '../services/dbService';
import { AuthRequest } from '../middleware/auth';

export const getAuditLogs = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { action, resource, search, limit = '50' } = req.query;

    let logs = db.getAuditLogs();

    if (action) {
      logs = logs.filter(l => l.action.toLowerCase().includes((action as string).toLowerCase()));
    }

    if (resource) {
      logs = logs.filter(l => l.resource === resource);
    }

    if (search) {
      const q = (search as string).toLowerCase();
      logs = logs.filter(
        l =>
          l.action.toLowerCase().includes(q) ||
          (l.userName && l.userName.toLowerCase().includes(q)) ||
          l.resource.toLowerCase().includes(q)
      );
    }

    const limitNum = parseInt(limit as string, 10);
    const paginated = logs.slice(0, limitNum);

    res.status(200).json({
      success: true,
      data: paginated,
      total: logs.length,
    });
  } catch (error) {
    next(error);
  }
};
