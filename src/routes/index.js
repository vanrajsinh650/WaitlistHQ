import { Router } from 'express';
import { rootIndex } from '../controllers/healthController.js';
import healthRoutes from './healthRoutes.js';

const router = Router();

// Base routes
router.get('/', rootIndex);

// Sub-routes mapping
router.use('/health', healthRoutes);

export default router;
