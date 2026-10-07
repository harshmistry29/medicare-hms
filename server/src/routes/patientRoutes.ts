import { Router } from 'express';
import { getPatients, getPatientById, createPatient, updatePatient, getPatientTimeline } from '../controllers/patientController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();

router.use(authenticate);

router.get('/', getPatients);
router.get('/:id', getPatientById);
router.get('/:id/timeline', getPatientTimeline);
router.post('/', authorize(['SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST']), createPatient);
router.put('/:id', authorize(['SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST']), updatePatient);

export default router;
