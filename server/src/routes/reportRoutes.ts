import { Router } from 'express';
import { getDashboardOverview } from '../controllers/reportController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/dashboard-overview', getDashboardOverview);

export default router;
