import { Router } from 'express';
import { 
  createSubscriber, 
  getAllSubscribers, 
  getSubscriberById, 
  deleteSubscriber 
} from '../controllers/subscriberController.js';
import { registrationLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// POST /subscribers
router.post('/', registrationLimiter, createSubscriber);

// GET /subscribers
router.get('/', getAllSubscribers);

// GET /subscribers/:id
router.get('/:id', getSubscriberById);

// DELETE /subscribers/:id
router.delete('/:id', deleteSubscriber);

export default router;
