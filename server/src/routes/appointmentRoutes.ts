import { Router } from 'express';
import {
  getAppointments,
  getAvailableSlots,
  createAppointment,
  checkInAppointment,
  updateAppointmentStatus,
  getWaitingQueue,
} from '../controllers/appointmentController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();

router.use(authenticate);

router.get('/', getAppointments);
router.get('/available-slots', getAvailableSlots);
router.get('/waiting-queue', getWaitingQueue);
router.post('/', createAppointment);
router.patch('/:id/check-in', authorize(['SUPER_ADMIN', 'ADMIN', 'RECEPTIONIST', 'NURSE']), checkInAppointment);
router.patch('/:id/status', updateAppointmentStatus);

export default router;
