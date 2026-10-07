import { Router } from 'express';
import { getRooms, createRoom, getBeds, getBedMap, updateBedStatus } from '../controllers/bedController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();

router.use(authenticate);

router.get('/rooms', getRooms);
router.post('/rooms', authorize(['SUPER_ADMIN', 'ADMIN']), createRoom);
router.get('/', getBeds);
router.get('/map', getBedMap);
router.patch('/:id/status', authorize(['SUPER_ADMIN', 'ADMIN', 'NURSE', 'RECEPTIONIST']), updateBedStatus);

export default router;
