import { Router } from 'express';
import { getHospitalSettings, updateHospitalSettings } from '../controllers/settingsController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();

router.use(authenticate);

router.get('/', getHospitalSettings);
router.put('/', authorize(['SUPER_ADMIN', 'ADMIN']), updateHospitalSettings);

export default router;
