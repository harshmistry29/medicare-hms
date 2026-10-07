import { Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../services/dbService';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { IEmergencyCase, EmergencyPriority } from '../types';

export const getEmergencyCases = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cases = db.getEmergencyCases();

    // Sort by priority (CRITICAL -> URGENT -> NORMAL), then arrivalTime desc
    const priorityWeight: Record<EmergencyPriority, number> = {
      CRITICAL: 3,
      URGENT: 2,
      NORMAL: 1,
    };

    cases.sort((a, b) => {
      const pDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
      if (pDiff !== 0) return pDiff;
      return new Date(b.arrivalTime).getTime() - new Date(a.arrivalTime).getTime();
    });

    res.status(200).json({
      success: true,
      data: cases,
    });
  } catch (error) {
    next(error);
  }
};

export const createEmergencyCase = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      patientName,
      age,
      gender,
      emergencyType,
      priority = 'URGENT',
      triageNotes,
      vitals,
      assignedDoctorId,
    } = req.body;

    if (!patientName || !emergencyType || !triageNotes) {
      throw new AppError('Patient name, emergency type, and triage notes are required', 400);
    }

    let doctor = assignedDoctorId ? db.getDoctorById(assignedDoctorId) : null;
    if (!doctor) {
      // Find emergency doctor or first available
      doctor = db.getDoctors().find(d => d.departmentId === 'dep-emergency') || db.getDoctors()[0];
    }

    const seq = (db.getEmergencyCases().length + 1).toString().padStart(4, '0');
    const emergencyNumber = `EMG-2026-${seq}`;

    const newCase: IEmergencyCase = {
      id: `emg-${uuidv4().substring(0, 8)}`,
      emergencyNumber,
      patientName,
      age: age ? parseInt(age, 10) : undefined,
      gender,
      emergencyType,
      priority,
      arrivalTime: new Date().toISOString(),
      assignedDoctorId: doctor?.id,
      assignedDoctorName: doctor?.name,
      triageNotes,
      vitals,
      status: 'TRIAGED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.addEmergencyCase(newCase);

    // If critical priority, fire notification
    if (priority === 'CRITICAL') {
      db.addNotification({
        id: `notif-${uuidv4()}`,
        role: 'DOCTOR',
        type: 'EMERGENCY',
        title: '🔴 CRITICAL EMERGENCY TRIAGE ALERT',
        message: `${patientName} (${emergencyType}) requires immediate critical resuscitation in Emergency Bay.`,
        link: '/emergency',
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }

    db.logAudit({
      userId: req.user?.id,
      userName: req.user?.name,
      userRole: req.user?.role,
      action: 'EMERGENCY_CASE_REGISTERED',
      resource: 'EMERGENCY',
      resourceId: newCase.id,
      metadata: { emergencyNumber, patientName, priority, emergencyType },
    });

    res.status(201).json({
      success: true,
      message: 'Emergency triage case registered successfully',
      data: newCase,
    });
  } catch (error) {
    next(error);
  }
};

export const updateEmergencyStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, assignedBedNumber, triageNotes } = req.body;

    const existing = db.getEmergencyCaseById(id);
    if (!existing) {
      throw new AppError('Emergency case not found', 404);
    }

    const updated = db.updateEmergencyCase(existing.id, {
      ...(status ? { status } : {}),
      ...(assignedBedNumber ? { assignedBedNumber } : {}),
      ...(triageNotes ? { triageNotes } : {}),
    });

    res.status(200).json({
      success: true,
      message: `Emergency case status updated to ${status}`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};
