import { Router } from 'express';
import {
  getLabTests,
  getLabOrders,
  getLabOrderById,
  createLabOrder,
  collectSample,
  enterLabResults,
} from '../controllers/labController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();

router.use(authenticate);

router.get('/tests', getLabTests);
router.get('/orders', getLabOrders);
router.get('/orders/:id', getLabOrderById);
router.post('/orders', authorize(['SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'RECEPTIONIST']), createLabOrder);
router.patch('/orders/:id/collect-sample', authorize(['SUPER_ADMIN', 'ADMIN', 'LAB_TECHNICIAN', 'NURSE']), collectSample);
router.post('/orders/:id/results', authorize(['SUPER_ADMIN', 'ADMIN', 'LAB_TECHNICIAN']), enterLabResults);

export default router;
