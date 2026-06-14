import { Router } from 'express';
import { createSubscriber, getAllSubscribers } from '../controllers/subscriberController.js';

const router = Router();

// POST /subscribers
router.post('/', createSubscriber);

// GET /subscribers (optional helper)
router.get('/', getAllSubscribers);

export default router;
