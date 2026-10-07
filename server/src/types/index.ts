export type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'DOCTOR'
  | 'NURSE'
  | 'RECEPTIONIST'
  | 'LAB_TECHNICIAN'
  | 'PHARMACIST'
  | 'ACCOUNTANT'
  | 'PATIENT';

export type AppointmentStatus =
  | 'SCHEDULED'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export type AppointmentType =
  | 'OPD'
  | 'FOLLOW_UP'
  | 'EMERGENCY'
  | 'TELECONSULTATION'
  | 'ROUTINE_CHECKUP';

export type LabOrderStatus =
  | 'ORDERED'
  | 'SAMPLE_COLLECTED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'CANCELLED';

export type BedStatus =
  | 'AVAILABLE'
  | 'OCCUPIED'
  | 'RESERVED'
  | 'MAINTENANCE';

export type RoomType =
  | 'GENERAL'
  | 'SEMI_PRIVATE'
  | 'PRIVATE'
  | 'ICU'
  | 'ISOLATION'
  | 'EMERGENCY';

export type AdmissionStatus =
  | 'ADMITTED'
  | 'UNDER_OBSERVATION'
  | 'DISCHARGED'
  | 'TRANSFERRED';

export type InvoiceStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'CANCELLED';

export type PaymentMethod =
  | 'CASH'
  | 'CARD'
  | 'UPI'
  | 'BANK_TRANSFER'
  | 'INSURANCE'
  | 'OTHER';

export type EmergencyPriority =
  | 'CRITICAL'
  | 'URGENT'
  | 'NORMAL';

export interface IUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  departmentId?: string;
  doctorProfileId?: string;
  patientProfileId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IPatient {
  id: string;
  patientId: string; // e.g. PAT-2026-0012
  userId?: string;
  firstName: string;
  lastName: string;
  fullName: string;
  dob: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  phone: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  allergies: string[];
  existingConditions: string[];
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
}

export interface IDoctorSchedule {
  dayOfWeek: number; // 0=Sunday, 1=Monday, etc.
  startTime: string; // "09:00"
  endTime: string;   // "17:00"
  slotDurationMinutes: number; // e.g. 20
  maxPatientsPerSlot?: number;
}

export interface IDoctor {
  id: string;
  doctorId: string; // DOC-2026-001
  userId: string;
  name: string;
  email: string;
  phone: string;
  departmentId: string;
  departmentName?: string;
  specialization: string;
  qualification: string;
  experienceYears: number;
  consultationFee: number;
  biography?: string;
  roomNumber?: string;
  avatar?: string;
  schedules: IDoctorSchedule[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IDepartment {
  id: string;
  name: string;
  code: string; // CARD, NEUR, ORTH, etc.
  description: string;
  headDoctorId?: string;
  headDoctorName?: string;
  locationFloor?: string;
  contactNumber?: string;
  isActive: boolean;
  createdAt: string;
}

export interface IAppointment {
  id: string;
  appointmentNumber: string; // APP-2026-0010
  patientId: string;
  patientName?: string;
  patientPhone?: string;
  doctorId: string;
  doctorName?: string;
  departmentId: string;
  departmentName?: string;
  date: string; // "YYYY-MM-DD"
  startTime: string; // "10:00"
  endTime: string; // "10:30"
  type: AppointmentType;
  reason: string;
  status: AppointmentStatus;
  checkInTime?: string;
  queueNumber?: number;
  notes?: string;
  fee: number;
  isPaid: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IVitals {
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number; // bpm
  temperature?: number; // °C
  respiratoryRate?: number; // breaths/min
  spO2?: number; // %
  heightCm?: number;
  weightKg?: number;
  bmi?: number;
}

export interface IConsultation {
  id: string;
  consultationNumber: string; // CON-2026-0045
  appointmentId?: string;
  patientId: string;
  patientName?: string;
  doctorId: string;
  doctorName?: string;
  departmentName?: string;
  date: string;
  chiefComplaint: string;
  symptoms: string[];
  vitals: IVitals;
  clinicalObservations?: string;
  diagnosis: string;
  treatmentPlan?: string;
  doctorNotes?: string;
  prescriptionId?: string;
  labOrderIds?: string[];
  followUpDate?: string;
  status: 'COMPLETED' | 'IN_PROGRESS';
  createdAt: string;
  updatedAt: string;
}

export interface IPrescriptionItem {
  medicineId: string;
  medicineName: string;
  dosage: string; // "500 mg"
  frequency: string; // "1-0-1", "Twice a day after food"
  route: 'ORAL' | 'IV' | 'IM' | 'TOPICAL' | 'INHALATION';
  duration: string; // "5 days"
  quantity: number; // 10 tablets
  instructions?: string;
  isDispensed?: boolean;
}

export interface IPrescription {
  id: string;
  prescriptionNumber: string; // RX-2026-0089
  consultationId?: string;
  patientId: string;
  patientName?: string;
  doctorId: string;
  doctorName?: string;
  date: string;
  diagnosis: string;
  items: IPrescriptionItem[];
  generalInstructions?: string;
  status: 'PENDING' | 'DISPENSED' | 'PARTIALLY_DISPENSED' | 'CANCELLED';
  dispensedAt?: string;
  dispensedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IMedicine {
  id: string;
  medicineCode: string; // MED-001
  name: string;
  genericName: string;
  brand: string;
  category: 'ANTIBIOTIC' | 'ANALGESIC' | 'ANTIDIABETIC' | 'ANTIHYPERTENSIVE' | 'ANTACID' | 'ANTIVIRAL' | 'VITAMIN' | 'OTHER';
  manufacturer: string;
  batchNumber: string;
  expiryDate: string; // YYYY-MM-DD
  purchasePrice: number;
  sellingPrice: number;
  currentStock: number;
  reorderLevel: number;
  unit: 'TABLET' | 'CAPSULE' | 'SYRUP' | 'INJECTION' | 'OINTMENT' | 'DROPS';
  locationShelf?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IPharmacyTransaction {
  id: string;
  prescriptionId?: string;
  patientId?: string;
  patientName?: string;
  items: {
    medicineId: string;
    medicineName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  totalAmount: number;
  dispensedBy: string;
  dispensedByName?: string;
  transactionDate: string;
  createdAt: string;
}

export interface ILabTest {
  id: string;
  code: string; // CBC, LFT, KFT, LIPID, FBS
  name: string;
  category: 'HEMATOLOGY' | 'BIOCHEMISTRY' | 'MICROBIOLOGY' | 'PATHOLOGY' | 'RADIOLOGY' | 'SEROLOGY';
  price: number;
  turnaroundHours: number;
  parameters: {
    name: string;
    unit: string;
    referenceRangeMin?: number;
    referenceRangeMax?: number;
    referenceRangeText?: string;
  }[];
  description?: string;
}

export interface ILabResultParameter {
  name: string;
  value: string | number;
  unit: string;
  referenceRange: string;
  status: 'NORMAL' | 'HIGH' | 'LOW' | 'ABNORMAL';
}

export interface ILabOrder {
  id: string;
  orderNumber: string; // LAB-2026-0050
  patientId: string;
  patientName?: string;
  patientAge?: number;
  patientGender?: string;
  doctorId: string;
  doctorName?: string;
  consultationId?: string;
  tests: {
    testId: string;
    testName: string;
    testCategory: string;
    price: number;
  }[];
  totalPrice: number;
  priority: 'NORMAL' | 'URGENT' | 'STAT';
  status: LabOrderStatus;
  requestedDate: string;
  sampleCollectedAt?: string;
  sampleCollectedBy?: string;
  results?: {
    testId: string;
    testName: string;
    parameters: ILabResultParameter[];
    remarks?: string;
    enteredBy?: string;
    enteredAt?: string;
    verifiedBy?: string;
    verifiedAt?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface IRoom {
  id: string;
  roomNumber: string; // 101, 201, ICU-01
  floor: string; // 1st Floor, 2nd Floor
  type: RoomType;
  capacity: number;
  dailyRate: number;
  status: 'ACTIVE' | 'MAINTENANCE';
  createdAt: string;
}

export interface IBed {
  id: string;
  bedNumber: string; // B-101-1, ICU-01-A
  roomId: string;
  roomNumber: string;
  roomType: RoomType;
  dailyRate: number;
  status: BedStatus;
  currentPatientId?: string;
  currentPatientName?: string;
  currentAdmissionId?: string;
  occupiedSince?: string;
  createdAt: string;
  updatedAt: string;
}

export interface INursingNote {
  id: string;
  admissionId: string;
  nurseId: string;
  nurseName: string;
  timestamp: string;
  vitals?: IVitals;
  medicationsAdministered?: string[];
  notes: string;
  observations: string;
}

export interface IAdmission {
  id: string;
  admissionNumber: string; // ADM-2026-0034
  patientId: string;
  patientName?: string;
  doctorId: string;
  doctorName?: string;
  roomId: string;
  roomNumber: string;
  bedId: string;
  bedNumber: string;
  admissionDate: string;
  expectedDischargeDate?: string;
  actualDischargeDate?: string;
  reasonForAdmission: string;
  initialDiagnosis: string;
  status: AdmissionStatus;
  dischargeSummary?: {
    finalDiagnosis: string;
    treatmentGiven: string;
    conditionAtDischarge: 'STABLE' | 'IMPROVED' | 'CRITICAL' | 'RECOVERED';
    dischargeMedications: string[];
    followUpInstructions: string;
    dischargedByDoctorName: string;
    dischargedAt: string;
  };
  totalDays?: number;
  roomCharges?: number;
  createdAt: string;
  updatedAt: string;
}

export interface IEmergencyCase {
  id: string;
  emergencyNumber: string; // EMG-2026-0012
  patientName: string;
  patientId?: string;
  age?: number;
  gender?: string;
  emergencyType: 'ACCIDENT' | 'CHEST_PAIN' | 'TRAUMA' | 'BREATHING_PROBLEM' | 'STROKE' | 'POISONING' | 'OTHER';
  priority: EmergencyPriority;
  arrivalTime: string;
  assignedDoctorId?: string;
  assignedDoctorName?: string;
  triageNotes: string;
  vitals?: IVitals;
  status: 'TRIAGED' | 'ATTENDED' | 'ADMITTED' | 'DISCHARGED' | 'TRANSFERRED';
  assignedBedNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IInvoiceItem {
  id: string;
  category: 'CONSULTATION' | 'LABORATORY' | 'PHARMACY' | 'ROOM_STAY' | 'PROCEDURE' | 'EMERGENCY' | 'OTHER';
  description: string;
  referenceId?: string;
  unitPrice: number;
  quantity: number;
  amount: number;
}

export interface IPayment {
  id: string;
  receiptNumber: string; // RCPT-2026-0087
  invoiceId: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionReference?: string;
  receivedBy: string;
  receivedByName: string;
  paymentDate: string;
  createdAt: string;
}

export interface IInvoice {
  id: string;
  invoiceNumber: string; // INV-2026-0095
  patientId: string;
  patientName: string;
  patientPhone?: string;
  items: IInvoiceItem[];
  subtotal: number;
  taxPercentage: number; // e.g. 5%
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  status: InvoiceStatus;
  issueDate: string;
  dueDate?: string;
  payments: IPayment[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface INotification {
  id: string;
  userId?: string;
  role?: UserRole;
  type: 'APPOINTMENT' | 'LAB_REPORT' | 'PRESCRIPTION' | 'BILLING' | 'INVENTORY' | 'EMERGENCY' | 'SYSTEM';
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface IAuditLog {
  id: string;
  userId?: string;
  userName?: string;
  userRole?: string;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface IHospitalSetting {
  id: string;
  hospitalName: string;
  tagline: string;
  registrationNumber: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  phone: string;
  emergencyPhone: string;
  email: string;
  website: string;
  currencySymbol: string; // ₹
  currencyCode: string; // INR
  timezone: string; // Asia/Kolkata
  taxPercentage: number; // 5%
  defaultSlotDuration: number; // 20 mins
}
