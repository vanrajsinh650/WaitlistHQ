import { Subscriber } from '../models/subscriber.model.js';
import { sendWelcomeEmail } from '../services/emailService.js';

// Helper regex to validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Add a new subscriber to the waitlist
 * POST /subscribers
 */
export const createSubscriber = async (req, res, next) => {
  try {
    const { email } = req.body;

    // 1. Validation: check if email is provided
    if (!email) {
      return res.status(400).json({
        error: 'Email is required'
      });
    }

    // 2. Validation: check email format
    const trimmedEmail = email.trim().toLowerCase();
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({
        error: 'Invalid email format'
      });
    }

    // 3. Database operations
    const newSubscriber = Subscriber.create(trimmedEmail);

    // 4. Send welcome email (asynchronous, non-blocking)
    sendWelcomeEmail(trimmedEmail).catch((error) => {
      console.error(`[Silent Email Failure] Failed to send welcome email to ${trimmedEmail}:`, error.message);
    });

    // 5. Return success response
    return res.status(201).json({
      success: true,
      message: 'Subscriber added successfully',
      data: newSubscriber
    });
  } catch (error) {
    // Catch unique constraint violation from SQLite (email duplication)
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({
        error: 'Subscriber already exists'
      });
    }
    
    // Pass other unexpected errors to the global error handler
    next(error);
  }
};

/**
 * Get all subscribers
 * GET /subscribers
 */
export const getAllSubscribers = async (req, res, next) => {
  try {
    const subscribers = Subscriber.findAll();
    return res.status(200).json({
      success: true,
      data: subscribers
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a specific subscriber by ID
 * GET /subscribers/:id
 */
export const getSubscriberById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const subscriber = Subscriber.findById(id);

    if (!subscriber) {
      return res.status(404).json({
        error: 'Subscriber not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: subscriber
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a specific subscriber by ID
 * DELETE /subscribers/:id
 */
export const deleteSubscriber = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if subscriber exists first
    const subscriber = Subscriber.findById(id);
    if (!subscriber) {
      return res.status(404).json({
        error: 'Subscriber not found'
      });
    }

    // Delete row
    Subscriber.delete(id);

    return res.status(200).json({
      success: true,
      message: 'Subscriber deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
