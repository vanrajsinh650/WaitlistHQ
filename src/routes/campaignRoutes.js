import { Router } from 'express';
import { createCampaign, getAllCampaigns } from '../controllers/campaignController.js';

const router = Router();

// POST /campaigns
router.post('/', createCampaign);

// GET /campaigns
router.get('/', getAllCampaigns);

export default router;
