import { Response, NextFunction } from 'express';
import { db } from '../services/dbService';
import { AuthRequest } from '../middleware/auth';

export const globalSearch = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string' || q.trim().length < 2) {
      res.status(200).json({
        success: true,
        data: {
          patients: [],
          doctors: [],
          appointments: [],
          prescriptions: [],
          invoices: [],
          medicines: [],
          labTests: [],
        },
      });
      return;
    }

    const query = q.trim().toLowerCase();

    const patients = db.getPatients().filter(
      p =>
        p.fullName.toLowerCase().includes(query) ||
        p.patientId.toLowerCase().includes(query) ||
        p.phone.includes(query)
    ).slice(0, 5);

    const doctors = db.getDoctors().filter(
      d =>
        d.name.toLowerCase().includes(query) ||
        d.specialization.toLowerCase().includes(query) ||
        (d.departmentName && d.departmentName.toLowerCase().includes(query))
    ).slice(0, 5);

    const appointments = db.getAppointments().filter(
      a =>
        a.appointmentNumber.toLowerCase().includes(query) ||
        (a.patientName && a.patientName.toLowerCase().includes(query)) ||
        (a.doctorName && a.doctorName.toLowerCase().includes(query))
    ).slice(0, 5);

    const prescriptions = db.getPrescriptions().filter(
      p =>
        p.prescriptionNumber.toLowerCase().includes(query) ||
        (p.patientName && p.patientName.toLowerCase().includes(query)) ||
        p.diagnosis.toLowerCase().includes(query)
    ).slice(0, 5);

    const invoices = db.getInvoices().filter(
      i =>
        i.invoiceNumber.toLowerCase().includes(query) ||
        i.patientName.toLowerCase().includes(query)
    ).slice(0, 5);

    const medicines = db.getMedicines().filter(
      m =>
        m.name.toLowerCase().includes(query) ||
        m.genericName.toLowerCase().includes(query) ||
        m.medicineCode.toLowerCase().includes(query)
    ).slice(0, 5);

    const labTests = db.getLabTests().filter(
      t =>
        t.name.toLowerCase().includes(query) ||
        t.code.toLowerCase().includes(query)
    ).slice(0, 5);

    res.status(200).json({
      success: true,
      data: {
        patients,
        doctors,
        appointments,
        prescriptions,
        invoices,
        medicines,
        labTests,
      },
    });
  } catch (error) {
    next(error);
  }
};
