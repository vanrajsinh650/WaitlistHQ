import { Campaign } from '../models/campaign.model.js';

/**
 * Create a new email campaign
 * POST /campaigns
 */
export const createCampaign = async (req, res, next) => {
  try {
    const { title, subject, content, status, send_at } = req.body;

    // 1. Validation: check required fields
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }
    if (!subject || !subject.trim()) {
      return res.status(400).json({ error: 'Subject is required' });
    }
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // 2. Validation: check status values if provided
    const validStatuses = ['draft', 'scheduled', 'sent'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    // 3. Validation: check send_at date format
    if (send_at && isNaN(Date.parse(send_at))) {
      return res.status(400).json({ error: 'Invalid send_at date format' });
    }

    // 4. Create database record
    const newCampaign = Campaign.create({
      title: title.trim(),
      subject: subject.trim(),
      content: content.trim(),
      status,
      send_at
    });

    // 5. Success response
    return res.status(201).json({
      success: true,
      message: 'Campaign created successfully',
      data: newCampaign
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List all campaigns
 * GET /campaigns
 */
export const getAllCampaigns = async (req, res, next) => {
  try {
    const campaigns = Campaign.findAll();
    return res.status(200).json({
      success: true,
      data: campaigns
    });
  } catch (error) {
    next(error);
  }
};
