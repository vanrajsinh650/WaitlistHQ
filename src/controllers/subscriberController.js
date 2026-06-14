import { Subscriber } from '../models/subscriber.model.js';

// Helper regex to validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const createSubscriber = async (req, res, next) => {
  try {
    const { email } = req.body;

    // 1. Validation: check if email is provided
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // 2. Validation: check email format
    const trimmedEmail = email.trim().toLowerCase();
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // 3. Database operations
    const newSubscriber = Subscriber.create(trimmedEmail);

    // 4. Return success response
    return res.status(201).json({
      success: true,
      message: 'Subscriber added successfully',
      data: newSubscriber
    });
  } catch (error) {
    // Catch unique constraint violation from SQLite
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    
    // Pass other unexpected errors to the global error handler
    next(error);
  }
};

/**
 * Optional handler to get all subscribers (great for debugging or building dashboard)
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
