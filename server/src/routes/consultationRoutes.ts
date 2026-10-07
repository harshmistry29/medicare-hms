import { Router } from 'express';
import { getConsultations, getConsultationById, createConsultation } from '../controllers/consultationController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();

router.use(authenticate);

router.get('/', getConsultations);
router.get('/:id', getConsultationById);
router.post('/', authorize(['SUPER_ADMIN', 'ADMIN', 'DOCTOR']), createConsultation);

export default router;
