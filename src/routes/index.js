import { Router } from 'express';
import { rootIndex } from '../controllers/healthController.js';
import healthRoutes from './healthRoutes.js';
import subscriberRoutes from './subscriberRoutes.js';

const router = Router();

// Base routes
router.get('/', rootIndex);

// Sub-routes mapping
router.use('/health', healthRoutes);
router.use('/subscribers', subscriberRoutes);

export default router;
