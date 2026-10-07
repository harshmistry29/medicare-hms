import axios from 'axios';

const API_BASE_URL = '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token from localStorage if present
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('medicare_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Global response error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token on 401 if not already on login
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('medicare_token');
        localStorage.removeItem('medicare_user');
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (data: any) => apiClient.post('/auth/login', data),
  register: (data: any) => apiClient.post('/auth/register', data),
  getMe: () => apiClient.get('/auth/me'),
  getDemoAccounts: () => apiClient.get('/auth/demo-accounts'),
};

export const patientsApi = {
  getAll: (params?: any) => apiClient.get('/patients', { params }),
  getById: (id: string) => apiClient.get(`/patients/${id}`),
  getTimeline: (id: string) => apiClient.get(`/patients/${id}/timeline`),
  create: (data: any) => apiClient.post('/patients', data),
  update: (id: string, data: any) => apiClient.put(`/patients/${id}`, data),
};

export const doctorsApi = {
  getAll: (params?: any) => apiClient.get('/doctors', { params }),
  getById: (id: string) => apiClient.get(`/doctors/${id}`),
  create: (data: any) => apiClient.post('/doctors', data),
  update: (id: string, data: any) => apiClient.put(`/doctors/${id}`, data),
};

export const departmentsApi = {
  getAll: () => apiClient.get('/departments'),
  getById: (id: string) => apiClient.get(`/departments/${id}`),
  create: (data: any) => apiClient.post('/departments', data),
};

export const appointmentsApi = {
  getAll: (params?: any) => apiClient.get('/appointments', { params }),
  getAvailableSlots: (doctorId: string, date: string) =>
    apiClient.get('/appointments/available-slots', { params: { doctorId, date } }),
  getWaitingQueue: () => apiClient.get('/appointments/waiting-queue'),
  create: (data: any) => apiClient.post('/appointments', data),
  checkIn: (id: string) => apiClient.patch(`/appointments/${id}/check-in`),
  updateStatus: (id: string, data: { status: string; notes?: string }) =>
    apiClient.patch(`/appointments/${id}/status`, data),
};

export const consultationsApi = {
  getAll: (params?: any) => apiClient.get('/consultations', { params }),
  getById: (id: string) => apiClient.get(`/consultations/${id}`),
  create: (data: any) => apiClient.post('/consultations', data),
};

export const prescriptionsApi = {
  getAll: (params?: any) => apiClient.get('/prescriptions', { params }),
  getById: (id: string) => apiClient.get(`/prescriptions/${id}`),
  create: (data: any) => apiClient.post('/prescriptions', data),
};

export const pharmacyApi = {
  getMedicines: (params?: any) => apiClient.get('/pharmacy/medicines', { params }),
  addMedicine: (data: any) => apiClient.post('/pharmacy/medicines', data),
  updateMedicine: (id: string, data: any) => apiClient.put(`/pharmacy/medicines/${id}`, data),
  dispense: (prescriptionId: string) => apiClient.post('/pharmacy/dispense', { prescriptionId }),
  getAlerts: () => apiClient.get('/pharmacy/alerts'),
};

export const labApi = {
  getTests: () => apiClient.get('/laboratory/tests'),
  getOrders: (params?: any) => apiClient.get('/laboratory/orders', { params }),
  getOrderById: (id: string) => apiClient.get(`/laboratory/orders/${id}`),
  createOrder: (data: any) => apiClient.post('/laboratory/orders', data),
  collectSample: (id: string) => apiClient.patch(`/laboratory/orders/${id}/collect-sample`),
  enterResults: (id: string, data: any) => apiClient.post(`/laboratory/orders/${id}/results`, data),
};

export const bedsApi = {
  getRooms: () => apiClient.get('/beds/rooms'),
  createRoom: (data: any) => apiClient.post('/beds/rooms', data),
  getBeds: (params?: any) => apiClient.get('/beds', { params }),
  getBedMap: () => apiClient.get('/beds/map'),
  updateStatus: (id: string, status: string) => apiClient.patch(`/beds/${id}/status`, { status }),
};

export const admissionsApi = {
  getAll: (params?: any) => apiClient.get('/admissions', { params }),
  getById: (id: string) => apiClient.get(`/admissions/${id}`),
  create: (data: any) => apiClient.post('/admissions', data),
  addNursingNote: (id: string, data: any) => apiClient.post(`/admissions/${id}/nursing-notes`, data),
  discharge: (id: string, data: any) => apiClient.post(`/admissions/${id}/discharge`, data),
};

export const billingApi = {
  getInvoices: (params?: any) => apiClient.get('/billing/invoices', { params }),
  getInvoiceById: (id: string) => apiClient.get(`/billing/invoices/${id}`),
  createInvoice: (data: any) => apiClient.post('/billing/invoices', data),
  recordPayment: (data: any) => apiClient.post('/billing/payments', data),
  getSummary: () => apiClient.get('/billing/summary'),
};

export const emergencyApi = {
  getAll: () => apiClient.get('/emergency'),
  create: (data: any) => apiClient.post('/emergency', data),
  updateStatus: (id: string, data: any) => apiClient.patch(`/emergency/${id}/status`, data),
};

export const reportsApi = {
  getDashboardOverview: () => apiClient.get('/reports/dashboard-overview'),
};

export const notificationsApi = {
  getAll: () => apiClient.get('/notifications'),
  markRead: (id: string) => apiClient.patch(`/notifications/${id}/read`),
  markAllRead: () => apiClient.post('/notifications/read-all'),
};

export const auditApi = {
  getAll: (params?: any) => apiClient.get('/audit-logs', { params }),
};

export const searchApi = {
  globalSearch: (q: string) => apiClient.get('/search', { params: { q } }),
};

export const settingsApi = {
  getSettings: () => apiClient.get('/settings'),
  updateSettings: (data: any) => apiClient.put('/settings', data),
};

export const aiApi = {
  getClinicalSummary: (patientId: string) => apiClient.post('/ai/clinical-summary', { patientId }),
  getNoShowRisk: (appointmentId: string) => apiClient.post('/ai/no-show-risk', { appointmentId }),
};

export const api = apiClient;
export default apiClient;
