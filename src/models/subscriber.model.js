import db from '../config/database.js';
import crypto from 'crypto';

export const Subscriber = {
  /**
   * Create a new subscriber record
   * @param {string} email - Subscriber email
   * @returns {object} The created subscriber record
   */
  create(email) {
    const token = crypto.randomBytes(24).toString('hex');
    const stmt = db.prepare(`
      INSERT INTO subscribers (email, unsubscribe_token)
      VALUES (?, ?)
    `);
    const info = stmt.run(email, token);
    
    // Retrieve and return the newly created row
    return this.findById(info.lastInsertRowid);
  },

  /**
   * Find a subscriber by ID
   * @param {number|string} id - Subscriber database ID
   * @returns {object|undefined} The subscriber record or undefined
   */
  findById(id) {
    const stmt = db.prepare(`
      SELECT * FROM subscribers
      WHERE id = ?
    `);
    return stmt.get(id);
  },

  /**
   * Find a subscriber by Email
   * @param {string} email - Subscriber email
   * @returns {object|undefined} The subscriber record or undefined
   */
  findByEmail(email) {
    const stmt = db.prepare(`
      SELECT * FROM subscribers
      WHERE email = ?
    `);
    return stmt.get(email);
  },

  /**
   * Get all subscribers
   * @returns {array} Array of all subscriber records
   */
  findAll() {
    const stmt = db.prepare(`
      SELECT * FROM subscribers
      ORDER BY created_at DESC
    `);
    return stmt.all();
  },

  /**
   * Delete a subscriber by ID
   * @param {number|string} id - Subscriber database ID
   * @returns {number} The number of rows deleted (0 or 1)
   */
  delete(id) {
    const stmt = db.prepare(`
      DELETE FROM subscribers
      WHERE id = ?
    `);
    const info = stmt.run(id);
    return info.changes;
  },

  /**
   * Find a subscriber by Unsubscribe Token
   * @param {string} token - The unsubscribe token
   * @returns {object|undefined} The subscriber record or undefined
   */
  findByUnsubscribeToken(token) {
    const stmt = db.prepare(`
      SELECT * FROM subscribers
      WHERE unsubscribe_token = ?
    `);
    return stmt.get(token);
  },

  /**
   * Update subscriber status
   * @param {number|string} id - Subscriber ID
   * @param {string} status - New status ('active', 'unsubscribed')
   * @returns {number} The number of rows updated (0 or 1)
   */
  updateStatus(id, status) {
    const stmt = db.prepare(`
      UPDATE subscribers
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    const info = stmt.run(status, id);
    return info.changes;
  },

  /**
   * Get all active subscribers
   * @returns {array} Array of active subscriber records
   */
  findActive() {
    const stmt = db.prepare(`
      SELECT * FROM subscribers
      WHERE status = 'active'
      ORDER BY created_at DESC
    `);
    return stmt.all();
  }
};
