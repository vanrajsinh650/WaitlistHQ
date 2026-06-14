import { Router } from 'express';
import { 
  createSubscriber, 
  getAllSubscribers, 
  getSubscriberById, 
  deleteSubscriber 
} from '../controllers/subscriberController.js';

const router = Router();

// POST /subscribers
router.post('/', createSubscriber);

// GET /subscribers
router.get('/', getAllSubscribers);

// GET /subscribers/:id
router.get('/:id', getSubscriberById);

// DELETE /subscribers/:id
router.delete('/:id', deleteSubscriber);

export default router;
