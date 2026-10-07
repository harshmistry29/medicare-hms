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
  patientId: string;
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
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
}

export interface IDoctor {
  id: string;
  doctorId: string;
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
  code: string;
  description: string;
  headDoctorId?: string;
  headDoctorName?: string;
  locationFloor?: string;
  contactNumber?: string;
  isActive: boolean;
  createdAt: string;
  doctorCount?: number;
  appointmentCount?: number;
}

export interface IAppointment {
  id: string;
  appointmentNumber: string;
  patientId: string;
  patientName?: string;
  patientPhone?: string;
  doctorId: string;
  doctorName?: string;
  departmentId: string;
  departmentName?: string;
  date: string;
  startTime: string;
  endTime: string;
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
  heartRate?: number;
  temperature?: number;
  respiratoryRate?: number;
  spO2?: number;
  heightCm?: number;
  weightKg?: number;
  bmi?: number;
}

export interface IConsultation {
  id: string;
  consultationNumber: string;
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
  dosage: string;
  frequency: string;
  route: 'ORAL' | 'IV' | 'IM' | 'TOPICAL' | 'INHALATION';
  duration: string;
  quantity: number;
  instructions?: string;
  isDispensed?: boolean;
}

export interface IPrescription {
  id: string;
  prescriptionNumber: string;
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
  medicineCode: string;
  name: string;
  genericName: string;
  brand: string;
  category: 'ANTIBIOTIC' | 'ANALGESIC' | 'ANTIDIABETIC' | 'ANTIHYPERTENSIVE' | 'ANTACID' | 'ANTIVIRAL' | 'VITAMIN' | 'OTHER';
  manufacturer: string;
  batchNumber: string;
  expiryDate: string;
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
  code: string;
  name: string;
  category: 'HEMATOLOGY' | 'BIOCHEMISTRY' | 'MICROBIOLOGY' | 'PATHOLOGY' | 'RADIOLOGY' | 'SEROLOGY';
  price: number;
  turnaroundHours: number;
  description?: string;
  parameters: {
    name: string;
    unit: string;
    referenceRangeMin?: number;
    referenceRangeMax?: number;
    referenceRangeText?: string;
  }[];
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
  orderNumber: string;
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
  roomNumber: string;
  floor: string;
  type: RoomType;
  capacity: number;
  dailyRate: number;
  status: 'ACTIVE' | 'MAINTENANCE';
  createdAt: string;
  totalBeds?: number;
  occupiedBeds?: number;
  availableBeds?: number;
}

export interface IBed {
  id: string;
  bedNumber: string;
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
  admissionNumber: string;
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
  emergencyNumber: string;
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
  receiptNumber: string;
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
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  patientPhone?: string;
  items: IInvoiceItem[];
  subtotal: number;
  taxPercentage: number;
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
  currencySymbol: string;
  currencyCode: string;
  timezone: string;
  taxPercentage: number;
  defaultSlotDuration: number;
}

// Aliases for seamless imports across modules
export type User = IUser | any;
export type Patient = IPatient | any;
export type Doctor = IDoctor | any;
export type Department = IDepartment | any;
export type Appointment = IAppointment | any;
export type Consultation = IConsultation | any;
export type Prescription = IPrescription | any;
export type Medicine = IMedicine | any;
export type LabOrder = ILabOrder | any;
export type Bed = IBed | any;
export type Room = IRoom | any;
export type Admission = IAdmission | any;
export type EmergencyCase = IEmergencyCase | any;
export type Invoice = IInvoice | any;
export type AuditLog = IAuditLog | any;
export type Notification = INotification | any;
export type HospitalSetting = IHospitalSetting | any;
