import { Router } from 'express';
import { generateClinicalSummary, predictNoShowRisk } from '../controllers/aiController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();

router.use(authenticate);

router.post('/clinical-summary', authorize(['SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'NURSE']), generateClinicalSummary);
router.post('/no-show-risk', predictNoShowRisk);

export default router;
