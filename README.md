# 🏥 MediCare HMS — Hospital Management & Information System

A modern, production-grade, enterprise-ready **Hospital Management System (HMS)** built with the **MERN stack** (React 18 + TypeScript + Vite + Tailwind CSS + Node.js + Express + Mongoose/MongoDB). 

Designed to support end-to-end clinical and administrative workflows across **9 user roles** with zero friction and complete database persistence.

---

## 🌟 Key Highlights & Architecture

- **End-to-End Hospital Digital Workflow**:
  $$\text{Registration} \longrightarrow \text{Appointment Booking} \longrightarrow \text{Reception Check-In} \longrightarrow \text{Doctor OPD Consultation} \longrightarrow \text{Prescription} \longrightarrow \text{Lab Diagnostics} \longrightarrow \text{Pharmacy Dispense} \longrightarrow \text{Ward Bed Admission} \longrightarrow \text{Nursing Care} \longrightarrow \text{GST Billing \& Settlement} \longrightarrow \text{Discharge Summary}$$
- **Role-Based Access Control (RBAC)**: Fine-grained permissions across 9 distinct roles with a **1-Click Live Persona Switcher** in the UI header.
- **Dual-Mode Persistence Engine**: Native MongoDB integration with an automatic zero-config file fallback (`.data/medicare_db.json`), ensuring the application runs out of the box even without a local MongoDB service.
- **AI Clinical & Operational Suite**: Assistive longitudinal EHR summarizer, appointment no-show probability predictor, seasonal hospital demand forecaster, and natural language query engine.
- **High-Quality Print Engine**: Dedicated print stylesheets for Doctor Prescriptions, Tax Invoices, Diagnostic Lab Reports, and Inpatient Discharge Summaries.

---

## 👥 Supported Roles & Demo Accounts

All demo accounts share the password: **`Medicare@123`** (or use the **1-Click Demo Login** buttons on the login screen):

| Role | Email | Name | Specialization / Department |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@medicare.local` | System Administrator | Hospital Operations & Compliance |
| **Doctor (Cardiology)** | `dr.patel@medicare.local` | Dr. Rajesh Patel, MD, DM | Cardiology & Cardiac Care |
| **Doctor (Neurology)** | `dr.shah@medicare.local` | Dr. Ananya Shah, MD, DM | Neurology & Stroke Unit |
| **Doctor (Pediatrics)** | `dr.mehta@medicare.local` | Dr. Siddharth Mehta, MD | Pediatrics & Child Health |
| **Doctor (Orthopedics)**| `dr.sharma@medicare.local`| Dr. Kavita Sharma, MS | Orthopedic Surgery |
| **Doctor (General)** | `dr.verma@medicare.local` | Dr. Vikram Verma, MD | Internal & General Medicine |
| **Nurse** | `nurse.mary@medicare.local` | Sister Mary D'Souza | Critical Care & Ward Nursing |
| **Receptionist** | `reception@medicare.local` | Priya Nair | Front Desk & Patient Intake |
| **Pharmacist** | `pharmacy@medicare.local` | Amit Deshmukh | Central Pharmacy & Inventory |
| **Lab Technician** | `lab@medicare.local` | Suresh Kumar | Pathology & Diagnostic Lab |
| **Accountant** | `billing@medicare.local` | Neha Joshi | Accounts & Revenue Billing |
| **Patient** | `patient.rahul@medicare.local` | Rahul Patel | Registered Patient Profile |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18.x or higher)
- **npm** (v9.x or higher)

### 2. Installation
Clone the repository and install all dependencies:

```bash
# Clone the repository
git clone https://github.com/your-username/medicare-hms.git
cd medicare-hms

# Install root, server, and client dependencies
npm install
npm --prefix server install
npm --prefix client install
```

### 3. Seed Database
Populate realistic hospital departments, doctors, patients, inventory, diagnostic tests, and ward beds:

```bash
npm run seed
```

### 4. Run Both Servers Concurrently
Start the backend Express API and the Vite React frontend with a single command:

```bash
npm run dev
```

- **Frontend Client**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000/api/v1](http://localhost:5000/api/v1)

---

## 🖥️ Complete Modules Overview

### 1. 📊 Executive & Departmental Dashboards
- Live hospital metrics: Total Patients, Inpatients, Available Beds, Pending Invoices, Gross Revenue, and Emergency Triage queue.
- Interactive **Recharts** charts: Revenue Invoicing Trends, Department Load Distribution, Ward Capacity Breakdown, and Diagnostic Pathology volume.
- Real-time clinical action alerts (Low medicine stock warnings, Critical ER cases, Unsettled invoices).

### 2. 🧑 Patient Management & Longitudinal EHR
- Master Patient Index (MPI) with custom ID generation (`PAT-2026-XXXX`).
- Multi-tab patient profile: Clinical Demographics, Medical History, Vital Signs progression, Past Prescriptions, Laboratory Reports, Inpatient Admissions, Billing History, and **Interactive Medical Timeline**.

### 3. 👨‍⚕️ Doctor OPD Consultation Suite
- Live waiting room queue with patient check-in status (`SCHEDULED` ➔ `CHECKED_IN` ➔ `IN_PROGRESS` ➔ `COMPLETED`).
- Clinical examination suite: Chief complaint, symptoms, vitals recording (BP, Pulse, Temp, SpO2, Respiratory Rate, BMI).
- Integrated one-click actions during consultation:
  - Prescribe medicines directly linked to Central Pharmacy inventory.
  - Order laboratory diagnostic tests directly routed to Pathology queue.
  - Automatically generate billing invoice and update patient EHR timeline.

### 4. 📅 Smart Appointment Scheduling
- Conflict-free time slot generator preventing double booking.
- Filter by department, doctor, and date with visual status tags.
- Patient self-booking portal and reception intake queue.

### 5. 💊 Central Pharmacy & Inventory Management
- Real-time inventory tracking with batch numbers, expiry dates, selling prices, and reorder levels.
- Prescription dispensing queue with automatic stock deduction and safety checks.
- Low-stock and expiring drug alert badges.

### 6. 🧪 Diagnostic Pathology & Laboratory
- Lab test request queue with priority tags (`ROUTINE`, `URGENT`, `STAT`).
- Test result entry with standard biological reference intervals, units, and technician remarks.
- Printable diagnostic test reports with hospital header.

### 7. 🛏️ Hospital Ward & Bed Management
- Visual Ward Map categorized into General Ward, Semi-Private, Private Deluxe, and ICU.
- Color-coded bed status: 🟢 Available, 🔴 Occupied, 🟡 Reserved, ⚪ Maintenance.
- One-click bed occupant inspection with attending physician details.

### 8. 🏨 Inpatient (IPD) Admissions & Nursing
- Admission workflow: Room/bed allocation, reason for admission, admitting physician.
- Nurse progress notes and longitudinal vitals tracking during patient stay.
- Formal Inpatient Discharge Summary builder with printable certificate and automatic bed release.

### 9. 🚨 Emergency & Trauma Triage Unit
- Real-time triage priority sorting: 🔴 **Critical** (Resuscitation), 🟠 **Urgent** (Within 15 mins), 🟢 **Normal**.
- Rapid intake modal with vital signs, chief complaint, trauma type, and attending emergency doctor allocation.

### 10. 💰 Automated GST Billing & Invoicing
- Itemized billing engine automatically aggregating consultation fees, lab investigations, pharmacy medicines, and daily room bed charges.
- GST calculation (5%, 12%, 18%), discount adjustment, and payment settlement (`CASH`, `UPI`, `CARD`, `NET_BANKING`, `INSURANCE`).
- Printable GST Tax Invoices and Payment Receipts.

### 11. 🤖 AI Clinical & Operational Assistant
- **Longitudinal EHR Summarizer**: Synthesizes past consultations, abnormal lab results, and current prescriptions into a concise clinical briefing for attending doctors.
- **No-Show Probability Predictor**: Evaluates booking lead time, transit distance, and past visit history to estimate missed appointment risk and recommend reception follow-ups.
- **Hospital Demand Forecaster**: Predicts expected OPD inflow, trauma arrivals, and ICU bed pressure.
- **Natural Language Search**: Plain-language query search across patients, admitted wards, and inventory.

### 12. 🛡️ Security & Compliance Audit Trail
- Comprehensive audit logging recording user identity, action type (`LOGIN`, `PATIENT_CREATED`, `CONSULTATION_COMPLETED`, `PRESCRIPTION_DISPENSED`, `BILL_PAID`), target resource, timestamp (IST), IP address, and payload metadata.

---

## 📁 Project Directory Structure

```text
medicare-hms/
├── client/                     # React 18 + Vite + TypeScript Frontend
│   ├── public/                 # Static assets & icons
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # Badge, Modal, StatCard, EmptyState, LoadingSkeleton
│   │   │   ├── forms/          # Patient, Appointment, Medicine, Lab, Admission, Payment, ER modals
│   │   │   ├── layout/         # AppLayout, Sidebar, Header, GlobalSearchModal, RoleBadge
│   │   │   └── printable/      # PrintablePrescription, PrintableInvoice, PrintableLabReport, DischargeSummary
│   │   ├── context/            # AuthContext, ToastContext, NotificationContext
│   │   ├── pages/
│   │   │   ├── admissions/     # InpatientListPage (IPD & Discharge)
│   │   │   ├── ai-assistant/   # AiClinicalAssistantPage (EHR Summarizer, Predictor)
│   │   │   ├── appointments/   # AppointmentListPage & Queue
│   │   │   ├── audit/          # AuditLogsPage
│   │   │   ├── auth/           # Login & Register
│   │   │   ├── beds/           # BedManagementPage (Ward Map)
│   │   │   ├── billing/        # InvoiceListPage & Payments
│   │   │   ├── consultations/  # ConsultationRoomPage (OPD Suite)
│   │   │   ├── dashboard/      # DashboardPage (Recharts BI)
│   │   │   ├── departments/    # DepartmentListPage
│   │   │   ├── doctors/        # DoctorListPage
│   │   │   ├── emergency/      # EmergencyTriagePage (Triage Queue)
│   │   │   ├── laboratory/     # LabOrdersPage (Pathology Results)
│   │   │   ├── patients/       # PatientListPage & PatientDetailPage (Timeline)
│   │   │   ├── pharmacy/       # PharmacyInventoryPage & Dispense
│   │   │   ├── reports/        # AnalyticsDashboardPage
│   │   │   └── settings/       # HospitalSettingsPage
│   │   ├── services/           # api.ts (Axios API Client & Interceptors)
│   │   ├── types/              # Comprehensive TypeScript interfaces & types
│   │   ├── App.tsx             # React Router v6 & Protected Routes
│   │   ├── index.css           # Tailwind directives & Print optimization
│   │   └── main.tsx            # Application entry point
│   ├── index.html
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── server/                     # Node.js + Express + TypeScript Backend
│   ├── src/
│   │   ├── config/             # env.ts (Environment configuration)
│   │   ├── controllers/        # 19 REST API Controllers
│   │   ├── data/               # seedData.ts (Realistic medical dataset)
│   │   ├── middleware/         # auth.ts, rbac.ts, errorHandler.ts
│   │   ├── models/             # Mongoose schemas & TypeScript models
│   │   ├── routes/             # Modular Express route handlers
│   │   ├── services/           # dbService.ts (Dual-mode MongoDB + JSON storage)
│   │   ├── app.ts              # Express app setup (CORS, Helmet, Rate Limiter)
│   │   ├── seed.ts             # Database seeder script
│   │   └── server.ts           # Server entry point
│   ├── tsconfig.json
│   └── package.json
│
├── package.json                # Root orchestration package.json
└── README.md                   # Full documentation
```

---

## 🔒 Security & Medical Compliance

- **Password Hashing**: Bcrypt/Argon2 secure password hashing.
- **Stateless Authentication**: JWT bearer tokens with expiration handling.
- **Server-Side Validation**: Strict input parsing and sanitization preventing injection attacks.
- **Clinical Safety Principles**: AI suggestions are clearly isolated as assistive decision-support tools with explicit clinical disclaimers.

---

## 📄 License
Developed for academic, research, and portfolio demonstration purposes.
