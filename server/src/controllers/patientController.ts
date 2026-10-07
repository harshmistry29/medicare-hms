import { Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../services/dbService';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { IPatient } from '../types';

export const getPatients = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, bloodGroup, gender, status, page = '1', limit = '10' } = req.query;

    let patients = db.getPatients();

    // If patient role, only return their own profile
    if (req.user?.role === 'PATIENT') {
      const patient = db.getPatientById(req.user.patientProfileId || req.user.id);
      patients = patient ? [patient] : [];
    }

    if (search) {
      const q = (search as string).toLowerCase();
      patients = patients.filter(
        p =>
          p.fullName.toLowerCase().includes(q) ||
          p.patientId.toLowerCase().includes(q) ||
          p.phone.includes(q) ||
          (p.email && p.email.toLowerCase().includes(q))
      );
    }

    if (bloodGroup) {
      patients = patients.filter(p => p.bloodGroup === bloodGroup);
    }

    if (gender) {
      patients = patients.filter(p => p.gender === gender);
    }

    if (status) {
      patients = patients.filter(p => p.status === status);
    }

    const total = patients.length;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = patients.slice(startIndex, startIndex + limitNum);

    res.status(200).json({
      success: true,
      data: paginated,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getPatientById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const patient = db.getPatientById(id);

    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    // Role check: patients can only access their own record
    if (req.user?.role === 'PATIENT' && req.user.patientProfileId !== patient.id && req.user.id !== patient.userId) {
      throw new AppError('Unauthorized to view this patient profile', 403);
    }

    // Gather related records
    const appointments = db.getAppointments().filter(a => a.patientId === patient.id);
    const consultations = db.getConsultations().filter(c => c.patientId === patient.id);
    const prescriptions = db.getPrescriptions().filter(p => p.patientId === patient.id);
    const labOrders = db.getLabOrders().filter(l => l.patientId === patient.id);
    const admissions = db.getAdmissions().filter(a => a.patientId === patient.id);
    const invoices = db.getInvoices().filter(i => i.patientId === patient.id);

    res.status(200).json({
      success: true,
      data: {
        ...patient,
        appointments,
        consultations,
        prescriptions,
        labOrders,
        admissions,
        invoices,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createPatient = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      firstName,
      lastName,
      dob,
      age,
      gender,
      bloodGroup,
      phone,
      email,
      address,
      city,
      state,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelation,
      allergies = [],
      existingConditions = [],
      insuranceProvider,
      insurancePolicyNumber,
    } = req.body;

    if (!firstName || !phone || !gender || !bloodGroup) {
      throw new AppError('First name, phone, gender, and blood group are required', 400);
    }

    const calculatedAge = age || (dob ? Math.floor((new Date().getTime() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 30);
    const seq = (db.getPatients().length + 1).toString().padStart(4, '0');
    const patientId = `PAT-2026-${seq}`;

    const newPatient: IPatient = {
      id: `pat-${uuidv4().substring(0, 8)}`,
      patientId,
      firstName,
      lastName: lastName || '',
      fullName: `${firstName} ${lastName || ''}`.trim(),
      dob: dob || '1995-01-01',
      age: calculatedAge,
      gender,
      bloodGroup,
      phone,
      email,
      address: address || 'N/A',
      city: city || 'Bengaluru',
      state: state || 'Karnataka',
      emergencyContactName: emergencyContactName || 'Family Contact',
      emergencyContactPhone: emergencyContactPhone || phone,
      emergencyContactRelation: emergencyContactRelation || 'Relative',
      allergies: Array.isArray(allergies) ? allergies : (allergies ? [allergies] : []),
      existingConditions: Array.isArray(existingConditions) ? existingConditions : (existingConditions ? [existingConditions] : []),
      insuranceProvider,
      insurancePolicyNumber,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.addPatient(newPatient);

    db.logAudit({
      userId: req.user?.id,
      userName: req.user?.name,
      userRole: req.user?.role,
      action: 'PATIENT_CREATED',
      resource: 'PATIENT',
      resourceId: newPatient.id,
      metadata: { patientId: newPatient.patientId, fullName: newPatient.fullName },
    });

    res.status(201).json({
      success: true,
      message: 'Patient registered successfully',
      data: newPatient,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePatient = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const existing = db.getPatientById(id);
    if (!existing) {
      throw new AppError('Patient not found', 404);
    }

    const updates = req.body;
    if (updates.firstName || updates.lastName) {
      const fn = updates.firstName || existing.firstName;
      const ln = updates.lastName !== undefined ? updates.lastName : existing.lastName;
      updates.fullName = `${fn} ${ln}`.trim();
    }

    const updated = db.updatePatient(existing.id, updates);

    db.logAudit({
      userId: req.user?.id,
      userName: req.user?.name,
      userRole: req.user?.role,
      action: 'PATIENT_UPDATED',
      resource: 'PATIENT',
      resourceId: existing.id,
      metadata: updates,
    });

    res.status(200).json({
      success: true,
      message: 'Patient profile updated',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const getPatientTimeline = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const patient = db.getPatientById(id);
    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    const events: {
      id: string;
      type: 'CONSULTATION' | 'LAB_ORDER' | 'ADMISSION' | 'PRESCRIPTION' | 'DISCHARGE' | 'PAYMENT';
      title: string;
      date: string;
      doctorName?: string;
      summary: string;
      badge: string;
      details: any;
    }[] = [];

    // Consultations
    const consultations = db.getConsultations().filter(c => c.patientId === patient.id);
    consultations.forEach(c => {
      events.push({
        id: `timeline-con-${c.id}`,
        type: 'CONSULTATION',
        title: `OPD Consultation — ${c.departmentName || 'Specialist'}`,
        date: c.date || c.createdAt,
        doctorName: c.doctorName,
        summary: `Diagnosis: ${c.diagnosis}. Chief complaint: ${c.chiefComplaint}`,
        badge: 'Consultation',
        details: c,
      });
    });

    // Lab Orders
    const labOrders = db.getLabOrders().filter(l => l.patientId === patient.id);
    labOrders.forEach(l => {
      events.push({
        id: `timeline-lab-${l.id}`,
        type: 'LAB_ORDER',
        title: `Lab Diagnostics — ${l.tests.map(t => t.testName).join(', ')}`,
        date: l.requestedDate || l.createdAt,
        doctorName: l.doctorName,
        summary: `Status: ${l.status}. Priority: ${l.priority}. Tests: ${l.tests.length}`,
        badge: 'Diagnostic Lab',
        details: l,
      });
    });

    // Prescriptions
    const prescriptions = db.getPrescriptions().filter(p => p.patientId === patient.id);
    prescriptions.forEach(p => {
      events.push({
        id: `timeline-rx-${p.id}`,
        type: 'PRESCRIPTION',
        title: `Prescription #${p.prescriptionNumber}`,
        date: p.date || p.createdAt,
        doctorName: p.doctorName,
        summary: `${p.items.length} medicines prescribed. Status: ${p.status}`,
        badge: 'Pharmacy',
        details: p,
      });
    });

    // Admissions
    const admissions = db.getAdmissions().filter(a => a.patientId === patient.id);
    admissions.forEach(a => {
      events.push({
        id: `timeline-adm-${a.id}`,
        type: 'ADMISSION',
        title: `Hospital Inpatient Admission (Room ${a.roomNumber}, Bed ${a.bedNumber})`,
        date: a.admissionDate,
        doctorName: a.doctorName,
        summary: `Reason: ${a.reasonForAdmission}. Status: ${a.status}`,
        badge: 'IPD Stay',
        details: a,
      });

      if (a.dischargeSummary) {
        events.push({
          id: `timeline-dis-${a.id}`,
          type: 'DISCHARGE',
          title: `Hospital Discharge (Room ${a.roomNumber})`,
          date: a.dischargeSummary.dischargedAt,
          doctorName: a.dischargeSummary.dischargedByDoctorName,
          summary: `Final Diagnosis: ${a.dischargeSummary.finalDiagnosis}. Condition: ${a.dischargeSummary.conditionAtDischarge}`,
          badge: 'Discharge',
          details: a.dischargeSummary,
        });
      }
    });

    // Invoices & Payments
    const invoices = db.getInvoices().filter(i => i.patientId === patient.id);
    invoices.forEach(inv => {
      inv.payments.forEach(pay => {
        events.push({
          id: `timeline-pay-${pay.id}`,
          type: 'PAYMENT',
          title: `Bill Payment Received (₹${pay.amount.toLocaleString('en-IN')})`,
          date: pay.paymentDate,
          summary: `Invoice #${inv.invoiceNumber} paid via ${pay.paymentMethod}. Receipt #${pay.receiptNumber}`,
          badge: 'Finance',
          details: pay,
        });
      });
    });

    // Sort descending by date
    events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    res.status(200).json({
      success: true,
      data: events,
    });
  } catch (error) {
    next(error);
  }
};
