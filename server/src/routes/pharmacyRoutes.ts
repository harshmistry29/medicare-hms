import { Router } from 'express';
import {
  getMedicines,
  addMedicine,
  updateMedicine,
  dispensePrescription,
  getPharmacyAlerts,
} from '../controllers/pharmacyController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();

router.use(authenticate);

router.get('/medicines', getMedicines);
router.post('/medicines', authorize(['SUPER_ADMIN', 'ADMIN', 'PHARMACIST']), addMedicine);
router.put('/medicines/:id', authorize(['SUPER_ADMIN', 'ADMIN', 'PHARMACIST']), updateMedicine);
router.post('/dispense', authorize(['SUPER_ADMIN', 'ADMIN', 'PHARMACIST']), dispensePrescription);
router.get('/alerts', getPharmacyAlerts);

export default router;
