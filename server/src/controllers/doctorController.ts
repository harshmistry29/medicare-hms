import { Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../services/dbService';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { IDoctor } from '../types';

export const getDoctors = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { departmentId, search } = req.query;
    let doctors = db.getDoctors().filter(d => d.isActive);

    if (departmentId) {
      doctors = doctors.filter(d => d.departmentId === departmentId);
    }

    if (search) {
      const q = (search as string).toLowerCase();
      doctors = doctors.filter(
        d =>
          d.name.toLowerCase().includes(q) ||
          d.specialization.toLowerCase().includes(q) ||
          (d.departmentName && d.departmentName.toLowerCase().includes(q))
      );
    }

    res.status(200).json({
      success: true,
      data: doctors,
    });
  } catch (error) {
    next(error);
  }
};

export const getDoctorById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const doctor = db.getDoctorById(id);
    if (!doctor) {
      throw new AppError('Doctor not found', 404);
    }

    // Today's appointments for this doctor
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = db.getAppointments().filter(
      a => a.doctorId === doctor.id && a.date === today && a.status !== 'CANCELLED'
    );

    res.status(200).json({
      success: true,
      data: {
        ...doctor,
        todayAppointments,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createDoctor = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      name,
      email,
      phone,
      departmentId,
      specialization,
      qualification,
      experienceYears,
      consultationFee,
      biography,
      roomNumber,
      avatar,
      schedules = [],
    } = req.body;

    if (!name || !email || !departmentId || !specialization || !consultationFee) {
      throw new AppError('Name, email, department, specialization, and consultation fee are required', 400);
    }

    const dept = db.getDepartmentById(departmentId);
    const seq = (db.getDoctors().length + 1).toString().padStart(3, '0');
    const doctorId = `DOC-2026-${seq}`;

    const newDoctor: IDoctor = {
      id: `doc-${uuidv4().substring(0, 8)}`,
      doctorId,
      userId: `usr-${uuidv4().substring(0, 8)}`,
      name,
      email,
      phone: phone || '+91 98000 00000',
      departmentId,
      departmentName: dept?.name || 'General',
      specialization,
      qualification: qualification || 'MBBS',
      experienceYears: parseInt(experienceYears || '5', 10),
      consultationFee: parseFloat(consultationFee),
      biography: biography || '',
      roomNumber: roomNumber || 'OPD-101',
      avatar: avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
      schedules: schedules.length > 0 ? schedules : [
        { dayOfWeek: 1, startTime: '09:00', endTime: '15:00', slotDurationMinutes: 20 },
        { dayOfWeek: 2, startTime: '09:00', endTime: '15:00', slotDurationMinutes: 20 },
        { dayOfWeek: 3, startTime: '09:00', endTime: '15:00', slotDurationMinutes: 20 },
        { dayOfWeek: 4, startTime: '09:00', endTime: '15:00', slotDurationMinutes: 20 },
        { dayOfWeek: 5, startTime: '09:00', endTime: '15:00', slotDurationMinutes: 20 },
      ],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.addDoctor(newDoctor);

    db.logAudit({
      userId: req.user?.id,
      userName: req.user?.name,
      userRole: req.user?.role,
      action: 'DOCTOR_CREATED',
      resource: 'DOCTOR',
      resourceId: newDoctor.id,
      metadata: { doctorId: newDoctor.doctorId, name: newDoctor.name },
    });

    res.status(201).json({
      success: true,
      message: 'Doctor added successfully',
      data: newDoctor,
    });
  } catch (error) {
    next(error);
  }
};

export const updateDoctor = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const existing = db.getDoctorById(id);
    if (!existing) {
      throw new AppError('Doctor not found', 404);
    }

    const updated = db.updateDoctor(existing.id, req.body);

    db.logAudit({
      userId: req.user?.id,
      userName: req.user?.name,
      userRole: req.user?.role,
      action: 'DOCTOR_UPDATED',
      resource: 'DOCTOR',
      resourceId: existing.id,
      metadata: req.body,
    });

    res.status(200).json({
      success: true,
      message: 'Doctor details updated',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};
