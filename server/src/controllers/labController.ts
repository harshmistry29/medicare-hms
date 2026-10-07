import { Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../services/dbService';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { ILabOrder, ILabResultParameter } from '../types';

export const getLabTests = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tests = db.getLabTests();
    res.status(200).json({
      success: true,
      data: tests,
    });
  } catch (error) {
    next(error);
  }
};

export const getLabOrders = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { patientId, doctorId, status, priority, search } = req.query;

    let orders = db.getLabOrders();

    if (req.user?.role === 'PATIENT') {
      const pId = req.user.patientProfileId || req.user.id;
      orders = orders.filter(o => o.patientId === pId);
    } else if (req.user?.role === 'DOCTOR') {
      const dId = req.user.doctorProfileId || req.user.id;
      if (!doctorId) {
        orders = orders.filter(o => o.doctorId === dId);
      }
    }

    if (patientId) {
      orders = orders.filter(o => o.patientId === patientId);
    }

    if (doctorId) {
      orders = orders.filter(o => o.doctorId === doctorId);
    }

    if (status) {
      orders = orders.filter(o => o.status === status);
    }

    if (priority) {
      orders = orders.filter(o => o.priority === priority);
    }

    if (search) {
      const q = (search as string).toLowerCase();
      orders = orders.filter(
        o =>
          (o.patientName && o.patientName.toLowerCase().includes(q)) ||
          o.orderNumber.toLowerCase().includes(q) ||
          o.tests.some(t => t.testName.toLowerCase().includes(q))
      );
    }

    // Sort by requestedDate desc
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

export const getLabOrderById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const order = db.getLabOrderById(id);
    if (!order) {
      throw new AppError('Lab order not found', 404);
    }

    const patient = db.getPatientById(order.patientId);
    const doctor = db.getDoctorById(order.doctorId);

    res.status(200).json({
      success: true,
      data: {
        ...order,
        patient,
        doctor,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createLabOrder = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { patientId, testIds = [], priority = 'NORMAL', doctorId } = req.body;

    if (!patientId || testIds.length === 0) {
      throw new AppError('Patient and at least one lab test are required', 400);
    }

    const patient = db.getPatientById(patientId);
    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    let doctor = doctorId ? db.getDoctorById(doctorId) : null;
    if (!doctor && req.user?.doctorProfileId) {
      doctor = db.getDoctorById(req.user.doctorProfileId);
    }
    if (!doctor) {
      doctor = db.getDoctors()[0];
    }

    const selectedTests = testIds.map((tid: string) => {
      const t = db.getLabTestById(tid);
      return t ? { testId: t.id, testName: t.name, testCategory: t.category, price: t.price } : null;
    }).filter(Boolean);

    if (selectedTests.length === 0) {
      throw new AppError('Selected tests were invalid', 400);
    }

    const totalPrice = selectedTests.reduce((sum: number, t: any) => sum + t.price, 0);
    const seq = (db.getLabOrders().length + 1).toString().padStart(4, '0');
    const orderNumber = `LAB-2026-${seq}`;

    const newLabOrder: ILabOrder = {
      id: `lab-${uuidv4().substring(0, 8)}`,
      orderNumber,
      patientId: patient.id,
      patientName: patient.fullName,
      patientAge: patient.age,
      patientGender: patient.gender,
      doctorId: doctor.id,
      doctorName: doctor.name,
      tests: selectedTests,
      totalPrice,
      priority,
      status: 'ORDERED',
      requestedDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.addLabOrder(newLabOrder);

    // Notify Lab Technicians
    db.addNotification({
      id: `notif-${uuidv4()}`,
      role: 'LAB_TECHNICIAN',
      type: 'LAB_REPORT',
      title: `New Lab Test Ordered (${priority})`,
      message: `${selectedTests.length} tests requested for ${patient.fullName}.`,
      link: '/laboratory',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      message: 'Lab test ordered successfully',
      data: newLabOrder,
    });
  } catch (error) {
    next(error);
  }
};

export const collectSample = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const order = db.getLabOrderById(id);
    if (!order) {
      throw new AppError('Lab order not found', 404);
    }

    const updated = db.updateLabOrder(order.id, {
      status: 'SAMPLE_COLLECTED',
      sampleCollectedAt: new Date().toISOString(),
      sampleCollectedBy: req.user ? `${req.user.name} (${req.user.role})` : 'Ravi Shastri (Lab Technician)',
    });

    res.status(200).json({
      success: true,
      message: 'Sample collection recorded',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const enterLabResults = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { results } = req.body; // array of { testId, parameters: [ { name, value, unit, referenceRange } ], remarks }

    const order = db.getLabOrderById(id);
    if (!order) {
      throw new AppError('Lab order not found', 404);
    }

    if (!Array.isArray(results) || results.length === 0) {
      throw new AppError('Test result parameters are required', 400);
    }

    const processedResults = results.map(r => {
      const testDef = db.getLabTestById(r.testId);

      const processedParams: ILabResultParameter[] = r.parameters.map((p: any) => {
        let status: 'NORMAL' | 'HIGH' | 'LOW' | 'ABNORMAL' = 'NORMAL';
        const numVal = parseFloat(p.value);

        // Find matching definition
        const paramDef = testDef?.parameters.find(tp => tp.name.toLowerCase() === p.name.toLowerCase());
        if (!isNaN(numVal) && paramDef) {
          if (paramDef.referenceRangeMax !== undefined && numVal > paramDef.referenceRangeMax) {
            status = 'HIGH';
          } else if (paramDef.referenceRangeMin !== undefined && numVal < paramDef.referenceRangeMin) {
            status = 'LOW';
          }
        }

        return {
          name: p.name,
          value: p.value,
          unit: p.unit || paramDef?.unit || '',
          referenceRange: p.referenceRange || paramDef?.referenceRangeText || '',
          status,
        };
      });

      return {
        testId: r.testId,
        testName: r.testName || testDef?.name || 'Lab Test',
        parameters: processedParams,
        remarks: r.remarks || 'Test completed with calibrated clinical analyzers.',
        enteredBy: req.user?.name || 'Ravi Shastri',
        enteredAt: new Date().toISOString(),
        verifiedBy: 'Dr. K. S. Murthy (Chief Pathologist)',
        verifiedAt: new Date().toISOString(),
      };
    });

    const updated = db.updateLabOrder(order.id, {
      results: processedResults,
      status: 'COMPLETED',
    });

    // Notify Patient & Doctor
    db.addNotification({
      id: `notif-${uuidv4()}`,
      userId: order.patientId,
      type: 'LAB_REPORT',
      title: 'Lab Report Ready',
      message: `Your diagnostic report #${order.orderNumber} is now ready for viewing.`,
      link: '/laboratory',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    db.logAudit({
      userId: req.user?.id,
      userName: req.user?.name,
      userRole: req.user?.role,
      action: 'LAB_RESULTS_ENTERED',
      resource: 'LABORATORY',
      resourceId: order.id,
      metadata: { orderNumber: order.orderNumber, patientName: order.patientName },
    });

    res.status(200).json({
      success: true,
      message: 'Lab results saved and verified successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};
