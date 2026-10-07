import { Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../services/dbService';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { IDepartment } from '../types';

export const getDepartments = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const departments = db.getDepartments();
    const doctors = db.getDoctors();
    const appointments = db.getAppointments();

    const withStats = departments.map(d => {
      const docCount = doctors.filter(doc => doc.departmentId === d.id).length;
      const apptCount = appointments.filter(a => a.departmentId === d.id).length;
      return {
        ...d,
        doctorCount: docCount,
        appointmentCount: apptCount,
      };
    });

    res.status(200).json({
      success: true,
      data: withStats,
    });
  } catch (error) {
    next(error);
  }
};

export const getDepartmentById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const dept = db.getDepartmentById(id);
    if (!dept) {
      throw new AppError('Department not found', 404);
    }

    const doctors = db.getDoctors().filter(d => d.departmentId === dept.id);
    const appointments = db.getAppointments().filter(a => a.departmentId === dept.id);

    res.status(200).json({
      success: true,
      data: {
        ...dept,
        doctors,
        appointments,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createDepartment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, code, description, locationFloor, contactNumber } = req.body;
    if (!name || !code) {
      throw new AppError('Department name and code are required', 400);
    }

    const newDept: IDepartment = {
      id: `dep-${code.toLowerCase()}`,
      name,
      code: code.toUpperCase(),
      description: description || '',
      locationFloor: locationFloor || '1st Floor',
      contactNumber: contactNumber || '+91 80 4912 3400',
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    db.addDepartment(newDept);

    res.status(201).json({
      success: true,
      message: 'Department created',
      data: newDept,
    });
  } catch (error) {
    next(error);
  }
};
