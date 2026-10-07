import { Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../services/dbService';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { IConsultation, IPrescription, ILabOrder, IInvoice, IInvoiceItem } from '../types';

export const getConsultations = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { patientId, doctorId, date } = req.query;

    let consultations = db.getConsultations();

    if (req.user?.role === 'PATIENT') {
      const pId = req.user.patientProfileId || req.user.id;
      consultations = consultations.filter(c => c.patientId === pId);
    } else if (req.user?.role === 'DOCTOR') {
      const dId = req.user.doctorProfileId || req.user.id;
      if (!doctorId) {
        consultations = consultations.filter(c => c.doctorId === dId);
      }
    }

    if (patientId) {
      consultations = consultations.filter(c => c.patientId === patientId);
    }

    if (doctorId) {
      consultations = consultations.filter(c => c.doctorId === doctorId);
    }

    if (date) {
      consultations = consultations.filter(c => c.date === date);
    }

    consultations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.status(200).json({
      success: true,
      data: consultations,
    });
  } catch (error) {
    next(error);
  }
};

export const getConsultationById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const consultation = db.getConsultationById(id);
    if (!consultation) {
      throw new AppError('Consultation not found', 404);
    }

    const prescription = consultation.prescriptionId ? db.getPrescriptionById(consultation.prescriptionId) : null;
    const labOrders = consultation.labOrderIds ? consultation.labOrderIds.map(oid => db.getLabOrderById(oid)).filter(Boolean) : [];

    res.status(200).json({
      success: true,
      data: {
        ...consultation,
        prescription,
        labOrders,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createConsultation = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      appointmentId,
      patientId,
      chiefComplaint,
      symptoms = [],
      vitals = {},
      clinicalObservations,
      diagnosis,
      treatmentPlan,
      doctorNotes,
      followUpDate,
      prescriptionItems = [],
      labTestIds = [],
      labPriority = 'NORMAL',
    } = req.body;

    if (!patientId || !chiefComplaint || !diagnosis) {
      throw new AppError('Patient, chief complaint, and diagnosis are required', 400);
    }

    const patient = db.getPatientById(patientId);
    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    // Determine Doctor
    let doctor = req.user?.doctorProfileId ? db.getDoctorById(req.user.doctorProfileId) : null;
    if (!doctor) {
      const allDoctors = db.getDoctors();
      doctor = allDoctors[0]; // default to first doctor if admin testing
    }

    const todayDate = new Date().toISOString().split('T')[0];
    const seq = (db.getConsultations().length + 1).toString().padStart(4, '0');
    const consultationNumber = `CON-2026-${seq}`;

    // 1. Calculate BMI if height and weight provided
    let calculatedVitals = { ...vitals };
    if (vitals.heightCm && vitals.weightKg) {
      const heightM = vitals.heightCm / 100;
      calculatedVitals.bmi = parseFloat((vitals.weightKg / (heightM * heightM)).toFixed(1));
    }

    let prescriptionId: string | undefined;
    let labOrderIds: string[] = [];

    // 2. Handle Prescription creation if medicines were prescribed
    if (prescriptionItems && prescriptionItems.length > 0) {
      const rxSeq = (db.getPrescriptions().length + 1).toString().padStart(4, '0');
      const newPrescription: IPrescription = {
        id: `rx-${uuidv4().substring(0, 8)}`,
        prescriptionNumber: `RX-2026-${rxSeq}`,
        consultationId: undefined, // updated below
        patientId: patient.id,
        patientName: patient.fullName,
        doctorId: doctor ? doctor.id : 'doc-patel',
        doctorName: doctor ? doctor.name : 'Dr. Rajesh Patel',
        date: todayDate,
        diagnosis,
        items: prescriptionItems.map((item: any) => ({
          medicineId: item.medicineId || 'med-001',
          medicineName: item.medicineName,
          dosage: item.dosage,
          frequency: item.frequency,
          route: item.route || 'ORAL',
          duration: item.duration,
          quantity: parseInt(item.quantity || '10', 10),
          instructions: item.instructions || '',
          isDispensed: false,
        })),
        generalInstructions: treatmentPlan || 'Take medications as instructed.',
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      db.addPrescription(newPrescription);
      prescriptionId = newPrescription.id;

      // Notify Pharmacy
      db.addNotification({
        id: `notif-${uuidv4()}`,
        role: 'PHARMACIST',
        type: 'PRESCRIPTION',
        title: 'New Prescription Ready for Dispensing',
        message: `Prescription #${newPrescription.prescriptionNumber} generated for ${patient.fullName} by ${doctor?.name}.`,
        link: '/pharmacy',
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }

    // 3. Handle Lab Orders creation if tests were requested
    if (labTestIds && labTestIds.length > 0) {
      const selectedTests = labTestIds.map((tid: string) => {
        const t = db.getLabTestById(tid);
        return t ? { testId: t.id, testName: t.name, testCategory: t.category, price: t.price } : null;
      }).filter(Boolean);

      if (selectedTests.length > 0) {
        const labSeq = (db.getLabOrders().length + 1).toString().padStart(4, '0');
        const totalPrice = selectedTests.reduce((sum: number, t: any) => sum + t.price, 0);

        const newLabOrder: ILabOrder = {
          id: `lab-${uuidv4().substring(0, 8)}`,
          orderNumber: `LAB-2026-${labSeq}`,
          patientId: patient.id,
          patientName: patient.fullName,
          patientAge: patient.age,
          patientGender: patient.gender,
          doctorId: doctor ? doctor.id : 'doc-patel',
          doctorName: doctor ? doctor.name : 'Dr. Rajesh Patel',
          tests: selectedTests,
          totalPrice,
          priority: labPriority,
          status: 'ORDERED',
          requestedDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        db.addLabOrder(newLabOrder);
        labOrderIds.push(newLabOrder.id);

        // Notify Laboratory
        db.addNotification({
          id: `notif-${uuidv4()}`,
          role: 'LAB_TECHNICIAN',
          type: 'LAB_REPORT',
          title: `New Lab Request (${labPriority})`,
          message: `${selectedTests.length} tests ordered for ${patient.fullName} by ${doctor?.name}.`,
          link: '/laboratory',
          isRead: false,
          createdAt: new Date().toISOString(),
        });
      }
    }

    // 4. Create Consultation Record
    const newConsultation: IConsultation = {
      id: `con-${uuidv4().substring(0, 8)}`,
      consultationNumber,
      appointmentId,
      patientId: patient.id,
      patientName: patient.fullName,
      doctorId: doctor ? doctor.id : 'doc-patel',
      doctorName: doctor ? doctor.name : 'Dr. Rajesh Patel',
      departmentName: doctor?.departmentName || 'General Medicine',
      date: todayDate,
      chiefComplaint,
      symptoms: Array.isArray(symptoms) ? symptoms : [symptoms],
      vitals: calculatedVitals,
      clinicalObservations,
      diagnosis,
      treatmentPlan,
      doctorNotes,
      prescriptionId,
      labOrderIds,
      followUpDate,
      status: 'COMPLETED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.addConsultation(newConsultation);

    // Link consultation to prescription
    if (prescriptionId) {
      db.updatePrescription(prescriptionId, { consultationId: newConsultation.id });
    }

    // 5. Update appointment if attached
    if (appointmentId) {
      db.updateAppointment(appointmentId, {
        status: 'COMPLETED',
      });
    }

    // 6. Generate Billing Line Item / Invoice
    const invoiceItems: IInvoiceItem[] = [
      {
        id: `item-${uuidv4().substring(0, 6)}`,
        category: 'CONSULTATION',
        description: `Consultation Fee (${doctor?.name || 'Specialist'})`,
        referenceId: newConsultation.id,
        unitPrice: doctor ? doctor.consultationFee : 800,
        quantity: 1,
        amount: doctor ? doctor.consultationFee : 800,
      }
    ];

    if (labOrderIds.length > 0) {
      const order = db.getLabOrderById(labOrderIds[0]);
      if (order) {
        order.tests.forEach(t => {
          invoiceItems.push({
            id: `item-${uuidv4().substring(0, 6)}`,
            category: 'LABORATORY',
            description: `Lab Test: ${t.testName}`,
            referenceId: order.id,
            unitPrice: t.price,
            quantity: 1,
            amount: t.price,
          });
        });
      }
    }

    const subtotal = invoiceItems.reduce((acc, item) => acc + item.amount, 0);
    const taxPercentage = 5.0;
    const taxAmount = parseFloat(((subtotal * taxPercentage) / 100).toFixed(2));
    const totalAmount = parseFloat((subtotal + taxAmount).toFixed(2));

    const invSeq = (db.getInvoices().length + 1).toString().padStart(4, '0');
    const newInvoice: IInvoice = {
      id: `inv-${uuidv4().substring(0, 8)}`,
      invoiceNumber: `INV-2026-${invSeq}`,
      patientId: patient.id,
      patientName: patient.fullName,
      patientPhone: patient.phone,
      items: invoiceItems,
      subtotal,
      taxPercentage,
      taxAmount,
      discountAmount: 0,
      totalAmount,
      paidAmount: 0,
      balanceAmount: totalAmount,
      status: 'PENDING',
      issueDate: todayDate,
      dueDate: todayDate,
      payments: [],
      notes: `Generated from OPD Consultation #${consultationNumber}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.addInvoice(newInvoice);

    // Notify Accountant
    db.addNotification({
      id: `notif-${uuidv4()}`,
      role: 'ACCOUNTANT',
      type: 'BILLING',
      title: 'New OPD Invoice Generated',
      message: `Invoice #${newInvoice.invoiceNumber} (₹${totalAmount.toLocaleString('en-IN')}) generated for ${patient.fullName}.`,
      link: '/billing',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    db.logAudit({
      userId: req.user?.id,
      userName: req.user?.name,
      userRole: req.user?.role,
      action: 'CONSULTATION_COMPLETED',
      resource: 'CONSULTATION',
      resourceId: newConsultation.id,
      metadata: {
        consultationNumber,
        patientName: patient.fullName,
        diagnosis,
        hasPrescription: !!prescriptionId,
        hasLabOrder: labOrderIds.length > 0,
        invoiceNumber: newInvoice.invoiceNumber,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Consultation saved and clinical workflow processed successfully',
      data: {
        consultation: newConsultation,
        prescriptionId,
        labOrderIds,
        invoiceId: newInvoice.id,
      },
    });
  } catch (error) {
    next(error);
  }
};
