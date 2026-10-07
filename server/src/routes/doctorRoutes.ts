import { Router } from 'express';
import { getDoctors, getDoctorById, createDoctor, updateDoctor } from '../controllers/doctorController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();

router.use(authenticate);

router.get('/', getDoctors);
router.get('/:id', getDoctorById);
router.post('/', authorize(['SUPER_ADMIN', 'ADMIN']), createDoctor);
router.put('/:id', authorize(['SUPER_ADMIN', 'ADMIN']), updateDoctor);

export default router;
