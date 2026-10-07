import { Router } from 'express';
import { getPrescriptions, getPrescriptionById, createPrescription } from '../controllers/prescriptionController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();

router.use(authenticate);

router.get('/', getPrescriptions);
router.get('/:id', getPrescriptionById);
router.post('/', authorize(['SUPER_ADMIN', 'ADMIN', 'DOCTOR']), createPrescription);

export default router;
