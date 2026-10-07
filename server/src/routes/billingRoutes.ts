import { Router } from 'express';
import {
  getInvoices,
  getInvoiceById,
  createInvoice,
  recordPayment,
  getFinancialSummary,
} from '../controllers/billingController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();

router.use(authenticate);

router.get('/invoices', getInvoices);
router.get('/invoices/:id', getInvoiceById);
router.post('/invoices', authorize(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), createInvoice);
router.post('/payments', authorize(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT', 'RECEPTIONIST']), recordPayment);
router.get('/summary', authorize(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), getFinancialSummary);

export default router;
