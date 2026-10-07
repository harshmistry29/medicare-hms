import { Router } from 'express';
import { getEmergencyCases, createEmergencyCase, updateEmergencyStatus } from '../controllers/emergencyController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();

router.use(authenticate);

router.get('/', getEmergencyCases);
router.post('/', authorize(['SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST']), createEmergencyCase);
router.patch('/:id/status', authorize(['SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'NURSE']), updateEmergencyStatus);

export default router;
