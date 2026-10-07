import { Response, NextFunction } from 'express';
import { db } from '../services/dbService';
import { AuthRequest } from '../middleware/auth';

export const getHospitalSettings = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const setting = db.getHospitalSetting();
    res.status(200).json({
      success: true,
      data: setting,
    });
  } catch (error) {
    next(error);
  }
};

export const updateHospitalSettings = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const updated = db.updateHospitalSetting(req.body);

    db.logAudit({
      userId: req.user?.id,
      userName: req.user?.name,
      userRole: req.user?.role,
      action: 'HOSPITAL_SETTINGS_UPDATED',
      resource: 'SETTINGS',
      resourceId: updated.id,
      metadata: req.body,
    });

    res.status(200).json({
      success: true,
      message: 'Hospital settings saved successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};
