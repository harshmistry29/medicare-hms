import { Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../services/dbService';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { IAppointment, AppointmentStatus } from '../types';

export const getAppointments = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { doctorId, patientId, departmentId, date, status, search } = req.query;

    let appointments = db.getAppointments();

    // If patient user, restrict to their appointments
    if (req.user?.role === 'PATIENT') {
      const pId = req.user.patientProfileId || req.user.id;
      appointments = appointments.filter(a => a.patientId === pId);
    } else if (req.user?.role === 'DOCTOR') {
      const dId = req.user.doctorProfileId || req.user.id;
      if (!doctorId) {
        appointments = appointments.filter(a => a.doctorId === dId);
      }
    }

    if (doctorId) {
      appointments = appointments.filter(a => a.doctorId === doctorId);
    }

    if (patientId) {
      appointments = appointments.filter(a => a.patientId === patientId);
    }

    if (departmentId) {
      appointments = appointments.filter(a => a.departmentId === departmentId);
    }

    if (date) {
      appointments = appointments.filter(a => a.date === date);
    }

    if (status) {
      appointments = appointments.filter(a => a.status === status);
    }

    if (search) {
      const q = (search as string).toLowerCase();
      appointments = appointments.filter(
        a =>
          (a.patientName && a.patientName.toLowerCase().includes(q)) ||
          (a.doctorName && a.doctorName.toLowerCase().includes(q)) ||
          a.appointmentNumber.toLowerCase().includes(q)
      );
    }

    // Sort by date desc, then startTime asc
    appointments.sort((a, b) => {
      if (b.date !== a.date) return b.date.localeCompare(a.date);
      return a.startTime.localeCompare(b.startTime);
    });

    res.status(200).json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
};

export const getAvailableSlots = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { doctorId, date } = req.query;
    if (!doctorId || !date) {
      throw new AppError('Doctor ID and date (YYYY-MM-DD) are required', 400);
    }

    const doctor = db.getDoctorById(doctorId as string);
    if (!doctor) {
      throw new AppError('Doctor not found', 404);
    }

    const targetDate = new Date(date as string);
    const dayOfWeek = targetDate.getDay(); // 0 = Sun, 1 = Mon ...

    const schedule = doctor.schedules.find(s => s.dayOfWeek === dayOfWeek);
    if (!schedule) {
      res.status(200).json({
        success: true,
        data: [],
        message: 'Doctor is not available on this day of the week.',
      });
      return;
    }

    const existingAppointments = db.getAppointments().filter(
      a => a.doctorId === doctor.id && a.date === date && a.status !== 'CANCELLED'
    );

    const bookedTimes = new Set(existingAppointments.map(a => a.startTime));

    // Generate slots
    const slots: { startTime: string; endTime: string; isAvailable: boolean }[] = [];
    const [startHour, startMin] = schedule.startTime.split(':').map(Number);
    const [endHour, endMin] = schedule.endTime.split(':').map(Number);
    const duration = schedule.slotDurationMinutes || 20;

    let currentMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    while (currentMinutes + duration <= endMinutes) {
      const slotStartH = Math.floor(currentMinutes / 60).toString().padStart(2, '0');
      const slotStartM = (currentMinutes % 60).toString().padStart(2, '0');
      const slotEndH = Math.floor((currentMinutes + duration) / 60).toString().padStart(2, '0');
      const slotEndM = ((currentMinutes + duration) % 60).toString().padStart(2, '0');

      const startTimeStr = `${slotStartH}:${slotStartM}`;
      const endTimeStr = `${slotEndH}:${slotEndM}`;

      slots.push({
        startTime: startTimeStr,
        endTime: endTimeStr,
        isAvailable: !bookedTimes.has(startTimeStr),
      });

      currentMinutes += duration;
    }

    res.status(200).json({
      success: true,
      data: slots,
    });
  } catch (error) {
    next(error);
  }
};

export const createAppointment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      patientId,
      doctorId,
      departmentId,
      date,
      startTime,
      endTime,
      type = 'OPD',
      reason,
      notes,
    } = req.body;

    if (!doctorId || !date || !startTime) {
      throw new AppError('Doctor, date, and start time are required', 400);
    }

    // Determine target patient
    let effectivePatientId = patientId;
    if (req.user?.role === 'PATIENT') {
      effectivePatientId = req.user.patientProfileId || req.user.id;
    }

    const patient = db.getPatientById(effectivePatientId);
    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    const doctor = db.getDoctorById(doctorId);
    if (!doctor) {
      throw new AppError('Doctor not found', 404);
    }

    const dept = db.getDepartmentById(departmentId || doctor.departmentId);

    // Double-booking check
    const existingConflict = db.getAppointments().find(
      a =>
        a.doctorId === doctorId &&
        a.date === date &&
        a.startTime === startTime &&
        a.status !== 'CANCELLED'
    );

    if (existingConflict) {
      throw new AppError('This appointment time slot is already booked. Please choose another slot.', 409);
    }

    const todayAppointments = db.getAppointments().filter(a => a.date === date && a.status !== 'CANCELLED');
    const queueNumber = todayAppointments.length + 1;

    const seq = (db.getAppointments().length + 1).toString().padStart(4, '0');
    const appointmentNumber = `APP-2026-${seq}`;

    const calculatedEndTime = endTime || (() => {
      const [h, m] = startTime.split(':').map(Number);
      const endMins = h * 60 + m + 20;
      return `${Math.floor(endMins / 60).toString().padStart(2, '0')}:${(endMins % 60).toString().padStart(2, '0')}`;
    })();

    const newAppointment: IAppointment = {
      id: `app-${uuidv4().substring(0, 8)}`,
      appointmentNumber,
      patientId: patient.id,
      patientName: patient.fullName,
      patientPhone: patient.phone,
      doctorId: doctor.id,
      doctorName: doctor.name,
      departmentId: dept?.id || doctor.departmentId,
      departmentName: dept?.name || doctor.departmentName || 'General Medicine',
      date,
      startTime,
      endTime: calculatedEndTime,
      type,
      reason: reason || 'General Consultation',
      status: 'SCHEDULED',
      queueNumber,
      notes,
      fee: doctor.consultationFee,
      isPaid: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.addAppointment(newAppointment);

    // Create In-App Notification for Doctor
    db.addNotification({
      id: `notif-${uuidv4()}`,
      userId: doctor.userId,
      role: 'DOCTOR',
      type: 'APPOINTMENT',
      title: 'New Appointment Booked',
      message: `${patient.fullName} booked an appointment for ${date} at ${startTime}.`,
      link: '/appointments',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    db.logAudit({
      userId: req.user?.id,
      userName: req.user?.name,
      userRole: req.user?.role,
      action: 'APPOINTMENT_BOOKED',
      resource: 'APPOINTMENT',
      resourceId: newAppointment.id,
      metadata: { appointmentNumber, patientName: patient.fullName, doctorName: doctor.name, date, startTime },
    });

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: newAppointment,
    });
  } catch (error) {
    next(error);
  }
};

export const checkInAppointment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const appointment = db.getAppointmentById(id);
    if (!appointment) {
      throw new AppError('Appointment not found', 404);
    }

    const updated = db.updateAppointment(appointment.id, {
      status: 'CHECKED_IN',
      checkInTime: new Date().toISOString(),
    });

    // Notify Doctor
    db.addNotification({
      id: `notif-${uuidv4()}`,
      role: 'DOCTOR',
      type: 'APPOINTMENT',
      title: 'Patient Checked In',
      message: `${appointment.patientName} has checked in for consultation with ${appointment.doctorName}.`,
      link: '/consultations',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    db.logAudit({
      userId: req.user?.id,
      userName: req.user?.name,
      userRole: req.user?.role,
      action: 'PATIENT_CHECKED_IN',
      resource: 'APPOINTMENT',
      resourceId: appointment.id,
      metadata: { patientName: appointment.patientName, queueNumber: appointment.queueNumber },
    });

    res.status(200).json({
      success: true,
      message: 'Patient checked in successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAppointmentStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const appointment = db.getAppointmentById(id);
    if (!appointment) {
      throw new AppError('Appointment not found', 404);
    }

    const updated = db.updateAppointment(appointment.id, {
      status: status as AppointmentStatus,
      notes: notes !== undefined ? notes : appointment.notes,
    });

    res.status(200).json({
      success: true,
      message: `Appointment marked as ${status}`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const getWaitingQueue = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    let appointments = db.getAppointments().filter(
      a => a.date === today && (a.status === 'CHECKED_IN' || a.status === 'IN_PROGRESS' || a.status === 'SCHEDULED')
    );

    if (req.user?.role === 'DOCTOR') {
      const dId = req.user.doctorProfileId || req.user.id;
      appointments = appointments.filter(a => a.doctorId === dId);
    }

    appointments.sort((a, b) => {
      // Checked in patients first
      if (a.status === 'CHECKED_IN' && b.status !== 'CHECKED_IN') return -1;
      if (b.status === 'CHECKED_IN' && a.status !== 'CHECKED_IN') return 1;
      return a.startTime.localeCompare(b.startTime);
    });

    res.status(200).json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
};
