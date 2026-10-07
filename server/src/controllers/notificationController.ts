import { Response, NextFunction } from 'express';
import { db } from '../services/dbService';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export const getNotifications = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const notifications = db.getNotifications();

    let userNotifications = notifications;
    if (req.user) {
      userNotifications = notifications.filter(
        n => !n.userId || n.userId === req.user?.id || (n.role && n.role === req.user?.role)
      );
    }

    const unreadCount = userNotifications.filter(n => !n.isRead).length;

    res.status(200).json({
      success: true,
      data: {
        notifications: userNotifications,
        unreadCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const markNotificationRead = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const updated = db.markNotificationAsRead(id);
    if (!updated) {
      throw new AppError('Notification not found', 404);
    }

    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const markAllNotificationsRead = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    db.markAllNotificationsRead(req.user?.id, req.user?.role);
    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    next(error);
  }
};
