import { Router } from 'express';
import {
  getAdmissions,
  getAdmissionById,
  createAdmission,
  addNursingNote,
  dischargePatient,
} from '../controllers/admissionController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();

router.use(authenticate);

router.get('/', getAdmissions);
router.get('/:id', getAdmissionById);
router.post('/', authorize(['SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'RECEPTIONIST']), createAdmission);
router.post('/:id/nursing-notes', authorize(['SUPER_ADMIN', 'ADMIN', 'NURSE', 'DOCTOR']), addNursingNote);
router.post('/:id/discharge', authorize(['SUPER_ADMIN', 'ADMIN', 'DOCTOR']), dischargePatient);

export default router;
