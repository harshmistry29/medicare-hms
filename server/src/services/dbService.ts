import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';
import {
  IUser,
  IPatient,
  IDoctor,
  IDepartment,
  IAppointment,
  IConsultation,
  IPrescription,
  IMedicine,
  IPharmacyTransaction,
  ILabTest,
  ILabOrder,
  IRoom,
  IBed,
  IAdmission,
  INursingNote,
  IInvoice,
  IPayment,
  INotification,
  IAuditLog,
  IEmergencyCase,
  IHospitalSetting
} from '../types';

export interface DatabaseSchema {
  users: IUser[];
  patients: IPatient[];
  doctors: IDoctor[];
  departments: IDepartment[];
  appointments: IAppointment[];
  consultations: IConsultation[];
  prescriptions: IPrescription[];
  medicines: IMedicine[];
  pharmacyTransactions: IPharmacyTransaction[];
  labTests: ILabTest[];
  labOrders: ILabOrder[];
  rooms: IRoom[];
  beds: IBed[];
  admissions: IAdmission[];
  nursingNotes: INursingNote[];
  invoices: IInvoice[];
  payments: IPayment[];
  notifications: INotification[];
  auditLogs: IAuditLog[];
  emergencyCases: IEmergencyCase[];
  hospitalSetting: IHospitalSetting;
}

const DATA_DIR = path.resolve(__dirname, '../../.data');
const DB_FILE = path.join(DATA_DIR, 'medicare_db.json');

class DatabaseService {
  private data: DatabaseSchema;
  private isMongoConnected: boolean = false;

  constructor() {
    this.data = this.getDefaultSchema();
    this.initStorage();
  }

  private getDefaultSchema(): DatabaseSchema {
    return {
      users: [],
      patients: [],
      doctors: [],
      departments: [],
      appointments: [],
      consultations: [],
      prescriptions: [],
      medicines: [],
      pharmacyTransactions: [],
      labTests: [],
      labOrders: [],
      rooms: [],
      beds: [],
      admissions: [],
      nursingNotes: [],
      invoices: [],
      payments: [],
      notifications: [],
      auditLogs: [],
      emergencyCases: [],
      hospitalSetting: {
        id: 'setting-1',
        hospitalName: 'MediCare Multi-Speciality Hospital',
        tagline: 'Excellence in Healthcare & Patient Compassion',
        registrationNumber: 'HOSP-MH-2026-8874',
        address: 'Plot 42, Health City, Outer Ring Road, Whitefield',
        city: 'Bengaluru',
        state: 'Karnataka',
        pinCode: '560066',
        phone: '+91 80 4912 3456',
        emergencyPhone: '+91 80 4912 9999 / 108',
        email: 'helpdesk@medicare.health',
        website: 'https://medicare.health',
        currencySymbol: '₹',
        currencyCode: 'INR',
        timezone: 'Asia/Kolkata',
        taxPercentage: 5.0,
        defaultSlotDuration: 20,
      }
    };
  }

  private initStorage() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = { ...this.getDefaultSchema(), ...JSON.parse(raw) };
      } else {
        this.persist();
      }
    } catch (err) {
      console.error('Error initializing file storage:', err);
    }
  }

  public persist() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error persisting database:', err);
    }
  }

  public async connectMongo(uri: string): Promise<boolean> {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
      this.isMongoConnected = true;
      console.log(' Successfully connected to MongoDB:', uri);
      return true;
    } catch (error) {
      this.isMongoConnected = false;
      console.log('ℹ MongoDB daemon not detected at URI. Using high-performance JSON & In-Memory Data Engine with persistence at .data/medicare_db.json.');
      return false;
    }
  }

  public get isConnected(): boolean {
    return this.isMongoConnected;
  }

  // Users
  public getUsers() { return this.data.users; }
  public getUserById(id: string) { return this.data.users.find(u => u.id === id); }
  public getUserByEmail(email: string) { return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase()); }
  public addUser(user: IUser) {
    this.data.users.push(user);
    this.persist();
    return user;
  }
  public updateUser(id: string, updates: Partial<IUser>) {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx >= 0) {
      this.data.users[idx] = { ...this.data.users[idx], ...updates, updatedAt: new Date().toISOString() };
      this.persist();
      return this.data.users[idx];
    }
    return null;
  }
  public deleteUser(id: string) {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx >= 0) {
      const removed = this.data.users.splice(idx, 1);
      this.persist();
      return removed[0];
    }
    return null;
  }

  // Patients
  public getPatients() { return this.data.patients; }
  public getPatientById(id: string) { return this.data.patients.find(p => p.id === id || p.patientId === id || p.userId === id); }
  public addPatient(patient: IPatient) {
    this.data.patients.push(patient);
    this.persist();
    return patient;
  }
  public updatePatient(id: string, updates: Partial<IPatient>) {
    const idx = this.data.patients.findIndex(p => p.id === id || p.patientId === id);
    if (idx >= 0) {
      this.data.patients[idx] = { ...this.data.patients[idx], ...updates, updatedAt: new Date().toISOString() };
      this.persist();
      return this.data.patients[idx];
    }
    return null;
  }

  // Doctors
  public getDoctors() { return this.data.doctors; }
  public getDoctorById(id: string) { return this.data.doctors.find(d => d.id === id || d.doctorId === id || d.userId === id); }
  public addDoctor(doctor: IDoctor) {
    this.data.doctors.push(doctor);
    this.persist();
    return doctor;
  }
  public updateDoctor(id: string, updates: Partial<IDoctor>) {
    const idx = this.data.doctors.findIndex(d => d.id === id || d.doctorId === id);
    if (idx >= 0) {
      this.data.doctors[idx] = { ...this.data.doctors[idx], ...updates, updatedAt: new Date().toISOString() };
      this.persist();
      return this.data.doctors[idx];
    }
    return null;
  }

  // Departments
  public getDepartments() { return this.data.departments; }
  public getDepartmentById(id: string) { return this.data.departments.find(d => d.id === id || d.code === id); }
  public addDepartment(dep: IDepartment) {
    this.data.departments.push(dep);
    this.persist();
    return dep;
  }
  public updateDepartment(id: string, updates: Partial<IDepartment>) {
    const idx = this.data.departments.findIndex(d => d.id === id);
    if (idx >= 0) {
      this.data.departments[idx] = { ...this.data.departments[idx], ...updates };
      this.persist();
      return this.data.departments[idx];
    }
    return null;
  }

  // Appointments
  public getAppointments() { return this.data.appointments; }
  public getAppointmentById(id: string) { return this.data.appointments.find(a => a.id === id || a.appointmentNumber === id); }
  public addAppointment(appt: IAppointment) {
    this.data.appointments.push(appt);
    this.persist();
    return appt;
  }
  public updateAppointment(id: string, updates: Partial<IAppointment>) {
    const idx = this.data.appointments.findIndex(a => a.id === id || a.appointmentNumber === id);
    if (idx >= 0) {
      this.data.appointments[idx] = { ...this.data.appointments[idx], ...updates, updatedAt: new Date().toISOString() };
      this.persist();
      return this.data.appointments[idx];
    }
    return null;
  }

  // Consultations
  public getConsultations() { return this.data.consultations; }
  public getConsultationById(id: string) { return this.data.consultations.find(c => c.id === id || c.consultationNumber === id); }
  public addConsultation(consultation: IConsultation) {
    this.data.consultations.push(consultation);
    this.persist();
    return consultation;
  }
  public updateConsultation(id: string, updates: Partial<IConsultation>) {
    const idx = this.data.consultations.findIndex(c => c.id === id);
    if (idx >= 0) {
      this.data.consultations[idx] = { ...this.data.consultations[idx], ...updates, updatedAt: new Date().toISOString() };
      this.persist();
      return this.data.consultations[idx];
    }
    return null;
  }

  // Prescriptions
  public getPrescriptions() { return this.data.prescriptions; }
  public getPrescriptionById(id: string) { return this.data.prescriptions.find(p => p.id === id || p.prescriptionNumber === id); }
  public addPrescription(rx: IPrescription) {
    this.data.prescriptions.push(rx);
    this.persist();
    return rx;
  }
  public updatePrescription(id: string, updates: Partial<IPrescription>) {
    const idx = this.data.prescriptions.findIndex(p => p.id === id || p.prescriptionNumber === id);
    if (idx >= 0) {
      this.data.prescriptions[idx] = { ...this.data.prescriptions[idx], ...updates, updatedAt: new Date().toISOString() };
      this.persist();
      return this.data.prescriptions[idx];
    }
    return null;
  }

  // Medicines
  public getMedicines() { return this.data.medicines; }
  public getMedicineById(id: string) { return this.data.medicines.find(m => m.id === id || m.medicineCode === id); }
  public addMedicine(med: IMedicine) {
    this.data.medicines.push(med);
    this.persist();
    return med;
  }
  public updateMedicine(id: string, updates: Partial<IMedicine>) {
    const idx = this.data.medicines.findIndex(m => m.id === id || m.medicineCode === id);
    if (idx >= 0) {
      this.data.medicines[idx] = { ...this.data.medicines[idx], ...updates, updatedAt: new Date().toISOString() };
      this.persist();
      return this.data.medicines[idx];
    }
    return null;
  }
  public deleteMedicine(id: string) {
    const idx = this.data.medicines.findIndex(m => m.id === id);
    if (idx >= 0) {
      const removed = this.data.medicines.splice(idx, 1);
      this.persist();
      return removed[0];
    }
    return null;
  }

  // Pharmacy Transactions
  public getPharmacyTransactions() { return this.data.pharmacyTransactions; }
  public addPharmacyTransaction(tx: IPharmacyTransaction) {
    this.data.pharmacyTransactions.push(tx);
    this.persist();
    return tx;
  }

  // Lab Tests
  public getLabTests() { return this.data.labTests; }
  public getLabTestById(id: string) { return this.data.labTests.find(t => t.id === id || t.code === id); }
  public addLabTest(test: ILabTest) {
    this.data.labTests.push(test);
    this.persist();
    return test;
  }

  // Lab Orders
  public getLabOrders() { return this.data.labOrders; }
  public getLabOrderById(id: string) { return this.data.labOrders.find(o => o.id === id || o.orderNumber === id); }
  public addLabOrder(order: ILabOrder) {
    this.data.labOrders.push(order);
    this.persist();
    return order;
  }
  public updateLabOrder(id: string, updates: Partial<ILabOrder>) {
    const idx = this.data.labOrders.findIndex(o => o.id === id || o.orderNumber === id);
    if (idx >= 0) {
      this.data.labOrders[idx] = { ...this.data.labOrders[idx], ...updates, updatedAt: new Date().toISOString() };
      this.persist();
      return this.data.labOrders[idx];
    }
    return null;
  }

  // Rooms & Beds
  public getRooms() { return this.data.rooms; }
  public getRoomById(id: string) { return this.data.rooms.find(r => r.id === id || r.roomNumber === id); }
  public addRoom(room: IRoom) {
    this.data.rooms.push(room);
    this.persist();
    return room;
  }

  public getBeds() { return this.data.beds; }
  public getBedById(id: string) { return this.data.beds.find(b => b.id === id || b.bedNumber === id); }
  public addBed(bed: IBed) {
    this.data.beds.push(bed);
    this.persist();
    return bed;
  }
  public updateBed(id: string, updates: Partial<IBed>) {
    const idx = this.data.beds.findIndex(b => b.id === id || b.bedNumber === id);
    if (idx >= 0) {
      this.data.beds[idx] = { ...this.data.beds[idx], ...updates, updatedAt: new Date().toISOString() };
      this.persist();
      return this.data.beds[idx];
    }
    return null;
  }

  // Admissions
  public getAdmissions() { return this.data.admissions; }
  public getAdmissionById(id: string) { return this.data.admissions.find(a => a.id === id || a.admissionNumber === id); }
  public addAdmission(adm: IAdmission) {
    this.data.admissions.push(adm);
    this.persist();
    return adm;
  }
  public updateAdmission(id: string, updates: Partial<IAdmission>) {
    const idx = this.data.admissions.findIndex(a => a.id === id || a.admissionNumber === id);
    if (idx >= 0) {
      this.data.admissions[idx] = { ...this.data.admissions[idx], ...updates, updatedAt: new Date().toISOString() };
      this.persist();
      return this.data.admissions[idx];
    }
    return null;
  }

  // Nursing Notes
  public getNursingNotes() { return this.data.nursingNotes; }
  public addNursingNote(note: INursingNote) {
    this.data.nursingNotes.push(note);
    this.persist();
    return note;
  }

  // Invoices & Payments
  public getInvoices() { return this.data.invoices; }
  public getInvoiceById(id: string) { return this.data.invoices.find(inv => inv.id === id || inv.invoiceNumber === id); }
  public addInvoice(inv: IInvoice) {
    this.data.invoices.push(inv);
    this.persist();
    return inv;
  }
  public updateInvoice(id: string, updates: Partial<IInvoice>) {
    const idx = this.data.invoices.findIndex(inv => inv.id === id || inv.invoiceNumber === id);
    if (idx >= 0) {
      this.data.invoices[idx] = { ...this.data.invoices[idx], ...updates, updatedAt: new Date().toISOString() };
      this.persist();
      return this.data.invoices[idx];
    }
    return null;
  }

  public getPayments() { return this.data.payments; }
  public addPayment(payment: IPayment) {
    this.data.payments.push(payment);
    this.persist();
    return payment;
  }

  // Emergency Cases
  public getEmergencyCases() { return this.data.emergencyCases; }
  public getEmergencyCaseById(id: string) { return this.data.emergencyCases.find(e => e.id === id || e.emergencyNumber === id); }
  public addEmergencyCase(emg: IEmergencyCase) {
    this.data.emergencyCases.push(emg);
    this.persist();
    return emg;
  }
  public updateEmergencyCase(id: string, updates: Partial<IEmergencyCase>) {
    const idx = this.data.emergencyCases.findIndex(e => e.id === id || e.emergencyNumber === id);
    if (idx >= 0) {
      this.data.emergencyCases[idx] = { ...this.data.emergencyCases[idx], ...updates, updatedAt: new Date().toISOString() };
      this.persist();
      return this.data.emergencyCases[idx];
    }
    return null;
  }

  // Notifications
  public getNotifications() { return this.data.notifications; }
  public addNotification(notification: INotification) {
    this.data.notifications.unshift(notification);
    this.persist();
    return notification;
  }
  public markNotificationAsRead(id: string) {
    const n = this.data.notifications.find(item => item.id === id);
    if (n) {
      n.isRead = true;
      this.persist();
      return n;
    }
    return null;
  }
  public markAllNotificationsRead(userId?: string, role?: string) {
    this.data.notifications.forEach(n => {
      if (!userId || n.userId === userId || (n.role && n.role === role)) {
        n.isRead = true;
      }
    });
    this.persist();
  }

  // Audit Logs
  public getAuditLogs() { return this.data.auditLogs; }
  public logAudit(log: Omit<IAuditLog, 'id' | 'timestamp'>) {
    const entry: IAuditLog = {
      id: `audit-${uuidv4()}`,
      timestamp: new Date().toISOString(),
      ...log,
    };
    this.data.auditLogs.unshift(entry);
    // Keep max 1000 logs in memory
    if (this.data.auditLogs.length > 1000) {
      this.data.auditLogs.pop();
    }
    this.persist();
    return entry;
  }

  // Hospital Settings
  public getHospitalSetting() { return this.data.hospitalSetting; }
  public updateHospitalSetting(updates: Partial<IHospitalSetting>) {
    this.data.hospitalSetting = { ...this.data.hospitalSetting, ...updates };
    this.persist();
    return this.data.hospitalSetting;
  }

  // Seed Reset
  public replaceAll(newData: DatabaseSchema) {
    this.data = newData;
    this.persist();
  }
}

export const db = new DatabaseService();
