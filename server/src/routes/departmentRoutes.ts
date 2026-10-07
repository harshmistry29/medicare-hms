import { Router } from 'express';
import { getDepartments, getDepartmentById, createDepartment } from '../controllers/departmentController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();

router.use(authenticate);

router.get('/', getDepartments);
router.get('/:id', getDepartmentById);
router.post('/', authorize(['SUPER_ADMIN', 'ADMIN']), createDepartment);

export default router;
