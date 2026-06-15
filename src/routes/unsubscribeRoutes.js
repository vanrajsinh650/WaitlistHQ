import { Router } from 'express';
import { unsubscribeSubscriber, resubscribeSubscriber } from '../controllers/unsubscribeController.js';

const router = Router();

router.get('/unsubscribe/:token', unsubscribeSubscriber);
router.get('/resubscribe/:token', resubscribeSubscriber);

export default router;
