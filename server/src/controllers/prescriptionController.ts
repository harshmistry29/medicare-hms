import { Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../services/dbService';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { IPrescription } from '../types';

export const getPrescriptions = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { patientId, doctorId, status, search } = req.query;

    let prescriptions = db.getPrescriptions();

    if (req.user?.role === 'PATIENT') {
      const pId = req.user.patientProfileId || req.user.id;
      prescriptions = prescriptions.filter(p => p.patientId === pId);
    } else if (req.user?.role === 'DOCTOR') {
      const dId = req.user.doctorProfileId || req.user.id;
      if (!doctorId) {
        prescriptions = prescriptions.filter(p => p.doctorId === dId);
      }
    }

    if (patientId) {
      prescriptions = prescriptions.filter(p => p.patientId === patientId);
    }

    if (doctorId) {
      prescriptions = prescriptions.filter(p => p.doctorId === doctorId);
    }

    if (status) {
      prescriptions = prescriptions.filter(p => p.status === status);
    }

    if (search) {
      const q = (search as string).toLowerCase();
      prescriptions = prescriptions.filter(
        p =>
          (p.patientName && p.patientName.toLowerCase().includes(q)) ||
          p.prescriptionNumber.toLowerCase().includes(q) ||
          p.diagnosis.toLowerCase().includes(q)
      );
    }

    prescriptions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.status(200).json({
      success: true,
      data: prescriptions,
    });
  } catch (error) {
    next(error);
  }
};

export const getPrescriptionById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const prescription = db.getPrescriptionById(id);
    if (!prescription) {
      throw new AppError('Prescription not found', 404);
    }

    const patient = db.getPatientById(prescription.patientId);
    const doctor = db.getDoctorById(prescription.doctorId);

    res.status(200).json({
      success: true,
      data: {
        ...prescription,
        patient,
        doctor,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createPrescription = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { patientId, diagnosis, items = [], generalInstructions } = req.body;

    if (!patientId || !diagnosis || items.length === 0) {
      throw new AppError('Patient, diagnosis, and at least one medicine item are required', 400);
    }

    const patient = db.getPatientById(patientId);
    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    let doctor = req.user?.doctorProfileId ? db.getDoctorById(req.user.doctorProfileId) : null;
    if (!doctor) {
      doctor = db.getDoctors()[0];
    }

    const seq = (db.getPrescriptions().length + 1).toString().padStart(4, '0');
    const prescriptionNumber = `RX-2026-${seq}`;

    const newPrescription: IPrescription = {
      id: `rx-${uuidv4().substring(0, 8)}`,
      prescriptionNumber,
      patientId: patient.id,
      patientName: patient.fullName,
      doctorId: doctor ? doctor.id : 'doc-patel',
      doctorName: doctor ? doctor.name : 'Dr. Rajesh Patel',
      date: new Date().toISOString().split('T')[0],
      diagnosis,
      items,
      generalInstructions,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.addPrescription(newPrescription);

    // Notify Pharmacist
    db.addNotification({
      id: `notif-${uuidv4()}`,
      role: 'PHARMACIST',
      type: 'PRESCRIPTION',
      title: 'New Prescription Created',
      message: `Prescription #${prescriptionNumber} created for ${patient.fullName}.`,
      link: '/pharmacy',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      message: 'Prescription created successfully',
      data: newPrescription,
    });
  } catch (error) {
    next(error);
  }
};
