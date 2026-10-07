import { Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../services/dbService';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { IAdmission, INursingNote, IInvoice, IInvoiceItem } from '../types';

export const getAdmissions = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, patientId, doctorId, search } = req.query;

    let admissions = db.getAdmissions();

    if (req.user?.role === 'PATIENT') {
      const pId = req.user.patientProfileId || req.user.id;
      admissions = admissions.filter(a => a.patientId === pId);
    }

    if (status) {
      admissions = admissions.filter(a => a.status === status);
    }

    if (patientId) {
      admissions = admissions.filter(a => a.patientId === patientId);
    }

    if (doctorId) {
      admissions = admissions.filter(a => a.doctorId === doctorId);
    }

    if (search) {
      const q = (search as string).toLowerCase();
      admissions = admissions.filter(
        a =>
          (a.patientName && a.patientName.toLowerCase().includes(q)) ||
          a.admissionNumber.toLowerCase().includes(q) ||
          a.roomNumber.toLowerCase().includes(q) ||
          a.initialDiagnosis.toLowerCase().includes(q)
      );
    }

    admissions.sort((a, b) => new Date(b.admissionDate).getTime() - new Date(a.admissionDate).getTime());

    res.status(200).json({
      success: true,
      data: admissions,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdmissionById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const admission = db.getAdmissionById(id);
    if (!admission) {
      throw new AppError('Admission record not found', 404);
    }

    const patient = db.getPatientById(admission.patientId);
    const doctor = db.getDoctorById(admission.doctorId);
    const nursingNotes = db.getNursingNotes().filter(n => n.admissionId === admission.id);

    res.status(200).json({
      success: true,
      data: {
        ...admission,
        patient,
        doctor,
        nursingNotes,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createAdmission = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      patientId,
      doctorId,
      bedId,
      reasonForAdmission,
      initialDiagnosis,
      expectedDischargeDate,
    } = req.body;

    if (!patientId || !doctorId || !bedId || !reasonForAdmission || !initialDiagnosis) {
      throw new AppError('Patient, doctor, bed, reason, and initial diagnosis are required', 400);
    }

    const patient = db.getPatientById(patientId);
    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    const doctor = db.getDoctorById(doctorId);
    if (!doctor) {
      throw new AppError('Doctor not found', 404);
    }

    const bed = db.getBedById(bedId);
    if (!bed) {
      throw new AppError('Bed not found', 404);
    }

    if (bed.status !== 'AVAILABLE') {
      throw new AppError(`Bed ${bed.bedNumber} is currently ${bed.status}. Please choose an available bed.`, 400);
    }

    const seq = (db.getAdmissions().length + 1).toString().padStart(4, '0');
    const admissionNumber = `ADM-2026-${seq}`;
    const admissionDate = new Date().toISOString();

    const newAdmission: IAdmission = {
      id: `adm-${uuidv4().substring(0, 8)}`,
      admissionNumber,
      patientId: patient.id,
      patientName: patient.fullName,
      doctorId: doctor.id,
      doctorName: doctor.name,
      roomId: bed.roomId,
      roomNumber: bed.roomNumber,
      bedId: bed.id,
      bedNumber: bed.bedNumber,
      admissionDate,
      expectedDischargeDate,
      reasonForAdmission,
      initialDiagnosis,
      status: 'ADMITTED',
      totalDays: 1,
      roomCharges: bed.dailyRate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.addAdmission(newAdmission);

    // Atomically update bed status
    db.updateBed(bed.id, {
      status: 'OCCUPIED',
      currentPatientId: patient.id,
      currentPatientName: patient.fullName,
      currentAdmissionId: newAdmission.id,
      occupiedSince: admissionDate,
    });

    // Notify Nursing Station
    db.addNotification({
      id: `notif-${uuidv4()}`,
      role: 'NURSE',
      type: 'SYSTEM',
      title: 'New Inpatient Admitted',
      message: `${patient.fullName} admitted to Room ${bed.roomNumber}, Bed ${bed.bedNumber} under ${doctor.name}.`,
      link: '/admissions',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    db.logAudit({
      userId: req.user?.id,
      userName: req.user?.name,
      userRole: req.user?.role,
      action: 'PATIENT_ADMITTED',
      resource: 'ADMISSION',
      resourceId: newAdmission.id,
      metadata: {
        admissionNumber,
        patientName: patient.fullName,
        roomNumber: bed.roomNumber,
        bedNumber: bed.bedNumber,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Patient admitted successfully and bed assigned',
      data: newAdmission,
    });
  } catch (error) {
    next(error);
  }
};

export const addNursingNote = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params; // admissionId
    const { vitals, medicationsAdministered = [], notes, observations } = req.body;

    const admission = db.getAdmissionById(id);
    if (!admission) {
      throw new AppError('Admission not found', 404);
    }

    const note: INursingNote = {
      id: `note-${uuidv4().substring(0, 8)}`,
      admissionId: admission.id,
      nurseId: req.user?.id || 'usr-nurse-1',
      nurseName: req.user?.name || 'Sister Maria D\'Souza (Staff Nurse)',
      timestamp: new Date().toISOString(),
      vitals,
      medicationsAdministered,
      notes: notes || 'Routine vitals recorded.',
      observations: observations || 'Patient comfortable.',
    };

    db.addNursingNote(note);

    res.status(201).json({
      success: true,
      message: 'Nursing observation & vitals logged',
      data: note,
    });
  } catch (error) {
    next(error);
  }
};

export const dischargePatient = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      finalDiagnosis,
      treatmentGiven,
      conditionAtDischarge = 'STABLE',
      dischargeMedications = [],
      followUpInstructions,
    } = req.body;

    const admission = db.getAdmissionById(id);
    if (!admission) {
      throw new AppError('Admission record not found', 404);
    }

    if (admission.status === 'DISCHARGED') {
      throw new AppError('Patient has already been discharged', 400);
    }

    const dischargeDate = new Date().toISOString();
    const admTime = new Date(admission.admissionDate).getTime();
    const disTime = new Date(dischargeDate).getTime();
    const diffDays = Math.max(1, Math.ceil((disTime - admTime) / (1000 * 60 * 60 * 24)));

    const bed = db.getBedById(admission.bedId);
    const dailyRate = bed ? bed.dailyRate : 1200;
    const totalRoomCharges = diffDays * dailyRate;

    const dischargeSummary = {
      finalDiagnosis: finalDiagnosis || admission.initialDiagnosis,
      treatmentGiven: treatmentGiven || 'Medical inpatient management and monitoring.',
      conditionAtDischarge: conditionAtDischarge as any,
      dischargeMedications: Array.isArray(dischargeMedications) ? dischargeMedications : [dischargeMedications],
      followUpInstructions: followUpInstructions || 'Review in OPD after 7 days.',
      dischargedByDoctorName: req.user?.name || admission.doctorName || 'Attending Physician',
      dischargedAt: dischargeDate,
    };

    // Update Admission
    const updatedAdmission = db.updateAdmission(admission.id, {
      status: 'DISCHARGED',
      actualDischargeDate: dischargeDate,
      totalDays: diffDays,
      roomCharges: totalRoomCharges,
      dischargeSummary,
    });

    // Release Bed -> Available
    if (bed) {
      db.updateBed(bed.id, {
        status: 'AVAILABLE',
        currentPatientId: undefined,
        currentPatientName: undefined,
        currentAdmissionId: undefined,
        occupiedSince: undefined,
      });
    }

    // Generate Final IPD Invoice
    const invoiceItems: IInvoiceItem[] = [
      {
        id: `item-${uuidv4().substring(0, 6)}`,
        category: 'ROOM_STAY',
        description: `Inpatient Room Charges (${diffDays} Days @ ₹${dailyRate}/day in ${admission.roomNumber})`,
        referenceId: admission.id,
        unitPrice: dailyRate,
        quantity: diffDays,
        amount: totalRoomCharges,
      },
      {
        id: `item-${uuidv4().substring(0, 6)}`,
        category: 'CONSULTATION',
        description: `Inpatient Doctor Rounds & Monitoring (${diffDays} Visits)`,
        referenceId: admission.id,
        unitPrice: 600,
        quantity: diffDays,
        amount: diffDays * 600,
      }
    ];

    const subtotal = invoiceItems.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = parseFloat(((subtotal * 5.0) / 100).toFixed(2));
    const totalAmount = parseFloat((subtotal + taxAmount).toFixed(2));
    const invSeq = (db.getInvoices().length + 1).toString().padStart(4, '0');

    const newInvoice: IInvoice = {
      id: `inv-${uuidv4().substring(0, 8)}`,
      invoiceNumber: `INV-2026-${invSeq}`,
      patientId: admission.patientId,
      patientName: admission.patientName || 'Patient',
      items: invoiceItems,
      subtotal,
      taxPercentage: 5.0,
      taxAmount,
      discountAmount: 0,
      totalAmount,
      paidAmount: 0,
      balanceAmount: totalAmount,
      status: 'PENDING',
      issueDate: dischargeDate.split('T')[0],
      dueDate: dischargeDate.split('T')[0],
      payments: [],
      notes: `Final IPD Discharge Invoice for Admission #${admission.admissionNumber}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.addInvoice(newInvoice);

    // Notify Accountant
    db.addNotification({
      id: `notif-${uuidv4()}`,
      role: 'ACCOUNTANT',
      type: 'BILLING',
      title: 'IPD Discharge Invoice Generated',
      message: `Discharge bill #${newInvoice.invoiceNumber} (₹${totalAmount.toLocaleString('en-IN')}) ready for ${admission.patientName}.`,
      link: '/billing',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    db.logAudit({
      userId: req.user?.id,
      userName: req.user?.name,
      userRole: req.user?.role,
      action: 'PATIENT_DISCHARGED',
      resource: 'ADMISSION',
      resourceId: admission.id,
      metadata: {
        admissionNumber: admission.admissionNumber,
        patientName: admission.patientName,
        totalDays: diffDays,
        roomCharges: totalRoomCharges,
        invoiceNumber: newInvoice.invoiceNumber,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Patient discharged successfully, bed released, and final IPD invoice generated',
      data: {
        admission: updatedAdmission,
        invoice: newInvoice,
      },
    });
  } catch (error) {
    next(error);
  }
};
